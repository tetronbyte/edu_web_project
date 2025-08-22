import os
import re
import json
import uuid
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from dotenv import load_dotenv
import requests

load_dotenv()

perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
perplexity_model = os.getenv("PERPLEXITY_MODEL", "sonar")
perplexity_api_base = os.getenv("PERPLEXITY_API_BASE", "https://api.perplexity.ai")
perplexity_api_url = f"{perplexity_api_base}/chat/completions"

@dataclass
class GraphingSessionState:
    """In-memory session state"""
    session_id: str
    user_context: Dict[str, Any]
    equation_history: List[Dict[str, Any]]
    current_equations: List[Dict[str, Any]]
    last_activity: datetime
    preferences: Dict[str, Any]
    conversation_history: List[Dict[str, Any]]

class AIService:
    """
    Always uses Perplexity 'sonar' model. Session is in-memory and context-aware.
    """

    def __init__(self):
        self.perplexity_api_key = perplexity_api_key
        self.perplexity_base_url = perplexity_api_url
        self.model = perplexity_model

        # Sessions in memory only
        self.sessions: Dict[str, GraphingSessionState] = {}
        self.session_timeout = timedelta(hours=2)

        self.max_equations = 10
        self.system_prompt = self._build_system_prompt()

        self._json_array_re = re.compile(r"\[[\s\S]*\]")
        self._bad_tokens_re = re.compile(r"(?:\bmod\b|%|\bfloor\b|\bceil\b|\||\\left|\\right)", re.IGNORECASE)
        self._unknown_command_re = re.compile(r"\\([a-zA-Z]+)")
        self._allowed_commands = {
            "sin","cos","tan","cot","sec","csc",
            "asin","acos","atan",
            "sinh","cosh","tanh",
            "log","ln","exp","sqrt","pi","theta"
        }

    def generate_equations_with_context(self, user_input: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Main entry to generate equations, with session context."""
        if not session_id or session_id not in self.sessions:
            session_id = self.create_session()

        self.cleanup_expired_sessions()
        context = self._analyze_user_input(user_input, session_id)

        result = self._run_perplexity_agent(user_input, context, session_id)

        if "error" in result:
            return {
                "success": False,
                "session_id": session_id,
                "error": result["error"],
                "details": result.get("details", ""),
                "equations": [],
                "message": "AI was unable to generate equations"
            }

        equations = result["equations"][: self.max_equations]
        session = self.sessions[session_id]
        session.equation_history.extend(equations)
        session.current_equations = equations
        session.last_activity = datetime.now()
        session.conversation_history.append({"type": "user", "message": user_input, "timestamp": datetime.now().isoformat()})
        session.conversation_history.append({"type": "assistant", "equations": equations, "timestamp": datetime.now().isoformat()})
        self._update_user_preferences(session, equations)

        return {
            "success": True,
            "equations": equations,
            "session_id": session_id,
            "context": context,
            "message": f"Generated {len(equations)} equations"
        }

    @classmethod
    def generate_math_expressions(cls, user_input: str):
        """Legacy fallback."""
        service = cls()
        return service._get_fallback_equations(user_input)

    def get_session_history(self, session_id: str) -> Dict[str, Any]:
        """Return session summary."""
        if session_id not in self.sessions:
            return {"error": "Session not found"}
        s = self.sessions[session_id]
        return {
            "session_id": session_id,
            "equation_count": len(s.equation_history),
            "current_equations": s.current_equations,
            "preferences": s.preferences,
            "last_activity": s.last_activity.isoformat(),
        }

    # ------------------ AGENT: Perplexity only ------------------
    def _run_perplexity_agent(self, user_input: str, context: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """
        Simple multi-pass with Perplexity API, using session context.
        """
        if not self.perplexity_api_key:
            return {"error": "api_not_configured", "equations": []}

        def call_llm(prompt: str) -> Dict[str, Any]:
            headers = {"Authorization": f"Bearer {self.perplexity_api_key}", "Content-Type": "application/json"}
            data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,
                "max_tokens": 1500,
            }
            try:
                r = requests.post(self.perplexity_base_url, headers=headers, json=data, timeout=30)
                if r.status_code != 200:
                    return {"err": f"api_error {r.status_code}", "txt": r.text}
                j = r.json()
                content = j.get("choices", [{}])[0].get("message", {}).get("content", "")
                return {"ok": True, "content": content}
            except Exception as e:
                return {"err": "api_down", "txt": str(e)}

        MAX_ATTEMPTS = 3
        raw = None
        prompt = self._build_context_prompt(user_input, context)

        for attempt in range(1, MAX_ATTEMPTS + 1):
            if attempt == 1 and raw is None:
                res = call_llm(prompt)
            else:
                critique = self._format_critique(issues)
                repair = (
                    f"{prompt}\n\n"
                    f"Your previous JSON was invalid for Desmos plotting.\n"
                    f"Fix ALL issues strictly and output ONLY a corrected JSON array:\n{critique}"
                )
                res = call_llm(repair)

            if res.get("err"):
                label = res["err"]
                return {"error": label, "details": res.get("txt", ""), "equations": []}

            raw = res["content"]
            candidates = self._extract_equations_from_response(raw)
            issues = self._validate_equations_list(candidates, user_input)
            if not issues:
                return {"equations": self._convert_equations_for_frontend(candidates)}

        return {"error": "invalid_ai_output", "details": "Failed to produce valid equations after self-repair loop", "equations": []}

    # ---------------- Prompting, Validation, Context awareness ----------------
    def _build_system_prompt(self) -> str:
        return f"""
You are an advanced Mathematical Graphing Assistant.
Your job is to generate equations that can be plotted directly in Desmos.

HARD RULES
1) Output only a valid JSON array (no extra text).
2) Prefer x–y relations. If user explicitly asks for polar/parametric, then use proper forms Desmos supports.
3) If additional parameters/constants are needed, REPLACE THEM with reasonable numeric values (no undefined symbols).
4) Equations must be immediately graphable in Desmos.
   - Do NOT use: modulus (% or mod), floor, ceil, absolute-value bars (|x|), or unknown LaTeX commands.
   - Allowed standard functions: sin, cos, tan, cot, sec, csc, asin, acos, atan, sinh, cosh, tanh, ln, log, exp, sqrt.
5) Provide at most {self.max_equations} equations per request.
6) Use simple LaTeX. No prose.

JSON FORMAT
[
  {{
    "latex": "y = x^2",
    "description": "Basic parabola",
    "type": "primary",
    "complexity": "basic",
    "related_concepts": ["algebra","quadratic"]
  }}
]

BEHAVIOR
- If the user is vague → provide simple, reasonable examples.
- If complex → keep forms Desmos-compatible, numeric where needed.
- Multiple variations allowed (max {self.max_equations}).
- Output ONLY the JSON array.
        """.strip()

    def _build_context_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        parts = [
            f"Task: generate up to {self.max_equations} Desmos-ready equations for: {user_input}",
            f"Request timestamp: {datetime.now().isoformat()}",
        ]
        if context.get("previous_equations"):
            recent = context["previous_equations"][-3:]
            parts.append("Recent session equations:")
            for eq in recent:
                parts.append(f"- {eq.get('equation') or eq.get('latex')}: {eq.get('description','')}")
        if context.get("preferences"):
            pref = context["preferences"]
            if "favorite_concepts" in pref:
                parts.append(f"User prefers: {', '.join(pref['favorite_concepts'])}")
            if "complexity_preference" in pref:
                parts.append(f"User prefers complexity: {pref['complexity_preference']}")
        parts.append("Ensure each equation is graphable in Desmos NOW; keep only x and y variables unless user requested otherwise.")
        return "\n".join(parts)

    def _extract_equations_from_response(self, response: str) -> List[Dict[str, Any]]:
        if not response:
            return []
        m = self._json_array_re.search(response)
        if not m:
            return []
        try:
            arr = json.loads(m.group(0))
            return arr if isinstance(arr, list) else []
        except Exception:
            return []

    def _validate_equations_list(self, equations: List[Dict[str, Any]], user_input: str) -> List[str]:
        """
        Returns list of issues (empty list means valid).
        Checks:
         - array length [1..max_equations]
         - each item has 'latex' and 'description'
         - latex is Desmos-safe (no banned tokens, balanced parens, only x,y unless explicitly allowed)
        """
        issues = []
        if not equations:
            return ["No equations found in JSON."]
        if len(equations) > self.max_equations:
            issues.append(f"Too many equations: {len(equations)} (max {self.max_equations}).")

        # Determine if polar/parametric allowed by the user message
        allow_polar = bool(re.search(r"\bpolar|r\s*=", user_input, re.IGNORECASE))
        allow_parametric = bool(re.search(r"\bparametric|\bx\(|\by\(", user_input, re.IGNORECASE))

        for i, eq in enumerate(equations, 1):
            if not isinstance(eq, dict):
                issues.append(f"Item {i} is not an object.")
                continue
            latex = (eq.get("latex") or "").strip()
            desc = (eq.get("description") or "").strip()
            if not latex:
                issues.append(f"Item {i} missing 'latex'.")
                continue
            if not desc:
                issues.append(f"Item {i} missing 'description'.")

            eq_issues = self._desmos_guardrails(latex, allow_parametric=allow_parametric, allow_polar=allow_polar)
            issues.extend([f"Item {i}: {msg}" for msg in eq_issues])

        return issues

    def _desmos_guardrails(self, latex: str, *, allow_parametric: bool, allow_polar: bool) -> List[str]:
        errs: List[str] = []

        # Quick rejects: unsupported tokens / commands
        if self._bad_tokens_re.search(latex):
            errs.append("Contains unsupported token (mod/%/floor/ceil/| or \\left/\\right).")

        # Balanced parentheses
        stack = 0
        for ch in latex:
            if ch == "(":
                stack += 1
            elif ch == ")":
                stack -= 1
                if stack < 0:
                    break
        if stack != 0:
            errs.append("Unbalanced parentheses.")

        # Unknown LaTeX commands (e.g., \foo)
        for m in self._unknown_command_re.finditer(latex):
            cmd = m.group(1).lower()
            if cmd not in self._allowed_commands:
                errs.append(f"Unknown LaTeX command '\\{cmd}'.")

        # Variable check: only x and y unless explicitly allowed polar/parametric
        # Ignore function names & allowed commands; detect bare letters.
        tokens = re.findall(r"[a-zA-Z]+", latex.replace("\\", ""))
        funcs = set(list(self._allowed_commands) + ["e", "pi", "theta"])
        free_vars = {t for t in tokens if t.lower() not in funcs and t.lower() not in {"x", "y"}}

        if free_vars:
            # Polar: allow r, theta
            if allow_polar and free_vars.issubset({"r", "theta"}):
                pass
            # Parametric: allow t in x(t), y(t) — but we asked to avoid unless explicit
            elif allow_parametric and free_vars.issubset({"t"}):
                pass
            else:
                errs.append(f"Contains variables other than x,y (found: {sorted(free_vars)}) without numeric values.")

        # Basic sanity: must look like relation with x,y (or r/theta)
        if not allow_polar and not re.search(r"[xy]", latex, re.IGNORECASE):
            errs.append("Equation does not reference x or y.")

        return errs

    def _format_critique(self, issues: List[str]) -> str:
        if not issues:
            return "No issues."
        bullets = "\n".join(f"- {s}" for s in issues)
        return f"Problems to fix:\n{bullets}\n\nRules to obey:\n- Use only x,y variables (or numeric constants).\n- No mod/floor/ceil/|x|.\n- Only standard functions sin,cos,tan,ln,log,exp,sqrt, etc.\n- <= {self.max_equations} equations.\n- Return ONLY JSON array."

    # ---------------------------------------------------------------------
    # Context & prefs
    # ---------------------------------------------------------------------
    def _extract_math_concepts(self, text: str) -> List[str]:
        text_lower = text.lower()
        concept_patterns = {
            "trigonometry": ["sin", "cos", "tan", "sine", "cosine"],
            "algebra": ["linear", "quadratic", "polynomial", "equation", "variable"],
            "calculus": ["derivative", "integral", "limit"],
            "geometry": ["circle", "ellipse", "parabola", "hyperbola", "line", "curve"],
            "physics": ["projectile", "wave", "oscillation", "velocity"],
            "statistics": ["distribution", "probability", "regression"],
            "art": ["pattern", "spiral", "flower", "heart"],
        }
        return [c for c, kws in concept_patterns.items() if any(k in text_lower for k in kws)]

    def _analyze_user_input(self, user_input: str, session_id: str) -> Dict[str, Any]:
        session = self.sessions.get(session_id)
        context = {
            "previous_equations": session.equation_history if session else [],
            "preferences": session.preferences if session else {},
            "conversation_length": len(session.conversation_history) if session else 0,
            "detected_concepts": self._extract_math_concepts(user_input),
        }
        return context

    def _convert_equations_for_frontend(self, equations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        converted = []
        for eq in equations[: self.max_equations]:
            converted.append({
                "equation": eq.get("latex", ""),
                "description": eq.get("description", ""),
                "type": eq.get("type", "primary"),
                "complexity": eq.get("complexity", "intermediate"),
                "related_concepts": eq.get("related_concepts", []),
            })
        return converted

    def _update_user_preferences(self, session: GraphingSessionState, equations: List[Dict[str, Any]]):
        complexities = [eq.get("complexity", "intermediate") for eq in equations]
        if complexities:
            session.preferences["complexity_preference"] = max(set(complexities), key=complexities.count)
        all_concepts: List[str] = []
        for eq in equations:
            all_concepts.extend(eq.get("related_concepts", []))
        if all_concepts:
            counts: Dict[str, int] = {}
            for c in all_concepts:
                counts[c] = counts.get(c, 0) + 1
            top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
            session.preferences["favorite_concepts"] = [k for k, _ in top]

    # ---------------------------------------------------------------------
    # Fallbacks & sessions
    # ---------------------------------------------------------------------
    def _get_fallback_equations(self, user_input: str) -> List[Dict[str, Any]]:
        text = user_input.lower()

        # "x = 4" or "y = -2"
        m = re.search(r"([xy])\s*=\s*(-?\d+(?:\.\d+)?)", text)
        if m:
            var, val = m.groups()
            if var == "x":
                return [{"equation": f"x = {val}", "description": f"Vertical line at x = {val}"}]
            return [{"equation": f"y = {val}", "description": f"Horizontal line at y = {val}"}]

        # Keywords
        patterns = {
            "flower": [{"equation": "y = x\\sin(x)", "description": "petal-like oscillations"}],
            "heart": [{"equation": "y = \\sqrt{1-x^2} - 0.5x^2", "description": "smooth heart-like curve"}],
            "spiral": [{"equation": "y = x\\sin(x)", "description": "spiral-ish oscillation"}],
            "sine": [{"equation": "y = \\sin(x)", "description": "Sine wave"}],
            "parabola": [{"equation": "y = x^2", "description": "Basic parabola"}],
            "circle": [{"equation": "x^2 + y^2 = 9", "description": "Circle radius 3"}],
        }
        for k, v in patterns.items():
            if k in text:
                return v

        # Default
        defaults = [
            [{"equation": "y = x^2", "description": "Quadratic"}, {"equation": "y = \\sin(x)", "description": "Sine"}],
            [{"equation": "y = x^3", "description": "Cubic"}, {"equation": "y = \\cos(x)", "description": "Cosine"}],
            [{"equation": "y = 2x + 1", "description": "Linear"}, {"equation": "y = \\ln(x)", "description": "Natural log"}],
        ]
        return random.choice(defaults)

    def create_session(self) -> str:
        sid = str(uuid.uuid4())
        self.sessions[sid] = GraphingSessionState(
            session_id=sid,
            user_context={},
            equation_history=[],
            current_equations=[],
            last_activity=datetime.now(),
            preferences={},
            conversation_history=[],
        )
        return sid

    def cleanup_expired_sessions(self):
        now = datetime.now()
        expired = [sid for sid, s in self.sessions.items() if now - s.last_activity > self.session_timeout]
        for sid in expired:
            del self.sessions[sid]