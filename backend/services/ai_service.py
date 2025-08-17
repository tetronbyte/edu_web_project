import os
import re
import json
import requests
from dotenv import load_dotenv

load_dotenv()

class AIService:
    PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
    PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions"

    ENHANCED_SYSTEM_PROMPT = """
    You are an advanced mathematical equation generator for Desmos graphing calculator. Use your reasoning capabilities to interpret diverse natural language descriptions and convert them into precise, immediately graphable mathematical equations.
EXPANDED PROMPT UNDERSTANDING:

1. BASIC SHAPES & CURVES:
- Geometric shapes: circles, ellipses, rectangles, triangles, polygons
- Conic sections: parabolas, hyperbolas, ellipses
- Common curves: sine, cosine, tangent, exponential, logarithmic

2. DESCRIPTIVE MODIFIERS:
- Size: small, large, tiny, huge, narrow, wide
- Position: shifted, moved, translated, centered, offset
- Orientation: rotated, tilted, flipped, inverted
- Amplitude: high, low, big, small amplitude
- Frequency: fast, slow, high, low frequency

3. MATHEMATICAL OPERATIONS:
- Transformations: stretch, compress, reflect, translate
- Combinations: intersection, union, sum, difference
- Derivatives: slope, tangent line, rate of change
- Integrals: area under curve, accumulated change

4. REAL-WORLD CONTEXTS:
- Physics: projectile motion, wave patterns, oscillations
- Economics: supply/demand curves, cost functions, profit maximization
- Biology: population growth, decay models, periodic cycles
- Engineering: signal processing, control systems, optimization

5. ARTISTIC & CREATIVE PROMPTS:
- Patterns: spirals, flowers, hearts, stars, geometric art
- Animations: moving objects, rotating shapes, oscillating patterns
- Symmetry: reflection, rotational symmetry, tessellations

REASONING PROCESS:
1. Identify the core mathematical concept
2. Interpret descriptive modifiers and context
3. Select appropriate mathematical form
4. Assign specific numerical parameters
5. Ensure immediate graphability in Desmos

COMPREHENSIVE EXAMPLES:

Input: "a flower with 5 petals"
Reasoning: Rose curve with n petals uses r = cos(nθ/2). For 5 petals, n=5. Convert to Cartesian or use polar form.
Output: [{"latex": "r = 3\\cos(2.5\\theta)", "description": "5-petaled rose curve"}]

Input: "projectile motion of a ball"
Reasoning: Projectile follows parabolic path y = x·tan(θ) - (g·x²)/(2·v₀²·cos²(θ)). Use typical values.
Output: [{"latex": "y = x - 0.05x^2", "description": "Parabolic trajectory of projectile motion"}]

Input: "heart shape for Valentine's Day"
Reasoning: Heart curve uses (x²+y²-1)³ = x²y³ or parametric form. Choose simpler implicit form.
Output: [{"latex": "(x^2 + y^2 - 1)^3 = x^2 \\cdot y^3", "description": "Heart-shaped curve"}]

Input: "spiral galaxy arm"
Reasoning: Logarithmic spiral r = ae^(bθ). Use moderate growth rate for visibility.
Output: [{"latex": "r = e^{0.2\\theta}", "description": "Logarithmic spiral resembling galaxy arm"}]

Input: "sound wave with low frequency"
Reasoning: Sound waves are sinusoidal. Low frequency means small coefficient of x.
Output: [{"latex": "y = \\sin(0.5x)", "description": "Low-frequency sine wave representing sound"}]

Input: "profit maximization curve"
Reasoning: Profit often follows inverted parabola with maximum point. Use realistic business context.
Output: [{"latex": "y = -0.1x^2 + 4x - 5", "description": "Profit function with maximum at x=20"}]

CRITICAL REQUIREMENTS:
- ALL equations must be immediately graphable (specific numerical values only)
- Use proper Desmos-compatible LaTeX syntax
- Maximum 2 equations per response
- Include brief reasoning before JSON output

RESPONSE FORMAT:
[Brief reasoning explanation]
    JSON:
    [
      {
        "latex": "complete equation ready for Desmos",
        "description": "clear explanation connecting to original prompt"
      }
    ]
    """

    @staticmethod
    def categorize_and_enhance_prompt(user_input: str) -> str:
        user_lower = (user_input or "").lower()
        if any(w in user_lower for w in ['projectile', 'motion', 'trajectory', 'physics', 'velocity', 'acceleration']):
            return f"Physics Context: {user_input}. Generate equations representing physical phenomena with realistic parameters."
        if any(w in user_lower for w in ['flower', 'heart', 'spiral', 'pattern', 'art', 'design', 'creative']):
            return f"Artistic Context: {user_input}. Generate visually appealing mathematical art with clear geometric beauty."
        if any(w in user_lower for w in ['profit', 'cost', 'revenue', 'demand', 'supply', 'economics', 'business']):
            return f"Economics Context: {user_input}. Generate realistic business/economic mathematical models."
        if any(w in user_lower for w in ['growth', 'population', 'decay', 'biological', 'natural', 'organism']):
            return f"Biology Context: {user_input}. Generate equations modeling biological processes with appropriate parameters."
        if any(w in user_lower for w in ['moving', 'rotating', 'oscillating', 'animation', 'dynamic', 'changing']):
            return f"Dynamic Context: {user_input}. Generate equations suitable for animation or time-varying behavior."
        return f"Mathematical Context: {user_input}. Generate precise mathematical equations."

    @staticmethod
    def extract_advanced_json_from_response(response_text: str):
        try:
            cleaned = re.sub(r'.*?', '', response_text or '', flags=re.DOTALL)

            json_marker_match = re.search(r'JSON:\s*($$.*?$$)', cleaned, flags=re.DOTALL)
            if json_marker_match:
                try:
                    return json.loads(json_marker_match.group(1))
                except json.JSONDecodeError:
                    pass

            json_array_matches = re.findall(r'\$\$(?:[^[$$]|(?:\$\$[^$$]*\$\$))*\$\$', cleaned, flags=re.DOTALL)
            for match in json_array_matches:
                try:
                    data = json.loads(match)
                    if isinstance(data, list) and data:
                        return data
                except json.JSONDecodeError:
                    continue

            first_bracket = cleaned.find('[')
            last_bracket = cleaned.rfind(']')
            if first_bracket != -1 and last_bracket != -1 and first_bracket < last_bracket:
                snippet = cleaned[first_bracket:last_bracket + 1]
                return json.loads(snippet)
        except Exception:
            pass
        return False

    @staticmethod
    def validate_enhanced_equations(equations):
        if not equations or not isinstance(equations, list):
            return False
        for eq in equations:
            if not isinstance(eq, dict) or 'latex' not in eq or 'description' not in eq:
                return False
            latex = (eq.get('latex') or '')
            suspicious = re.findall(r'\b[a-df-wz]\b(?![a-z])', latex.lower())
            allowed = ['e', 'pi', 'ln', 'sin', 'cos', 'tan', 'sqrt', 'log']
            suspicious = [v for v in suspicious if v not in allowed]
            if suspicious:
                return False
            if not any(elem in latex.lower() for elem in ['x', 'y', 'r', 'theta', '=', 'sin', 'cos', 'tan', 'log', 'sqrt']):
                return False
        return True

    @staticmethod
    def is_graphable_equation(latex: str) -> bool:
        cleaned = (latex or '').replace('\\pi', '').replace('\\sin', '').replace('\\cos', '') \
                               .replace('\\ln', '').replace('\\sqrt', '').replace('\\tan', '') \
                               .replace('\\log', '').replace('\\theta', '').replace('theta', '')
        suspicious = re.findall(r'\b[a-df-wz]\b', cleaned.lower())
        suspicious = [v for v in suspicious if v not in ['e', 'r']]
        return not bool(suspicious)

    @staticmethod
    def get_comprehensive_fallback_equations(user_input: str):
        text = (user_input or '').lower()
        if any(w in text for w in ['flower', 'rose', 'petal']):
            return [{"latex": "r = 3\\cos(2\\theta)", "description": "4-petaled rose curve (flower pattern)"}]
        if any(w in text for w in ['heart', 'love', 'valentine']):
            return [{"latex": "x^2 + (y - \\sqrt{|x|})^2 = 1", "description": "Heart-shaped curve"}]
        if any(w in text for w in ['spiral', 'galaxy', 'nautilus']):
            return [{"latex": "r = 0.5\\theta", "description": "Archimedean spiral"}]
        if any(w in text for w in ['star', 'asterisk']):
            return [{"latex": "r = 2 + \\cos(5\\theta)", "description": "Star-like pattern"}]
        if any(w in text for w in ['projectile', 'trajectory', 'motion', 'ball', 'cannon']):
            return [{"latex": "y = x - 0.02x^2", "description": "Projectile motion trajectory"}]
        if any(w in text for w in ['wave', 'sound', 'vibration', 'oscillation']):
            return [{"latex": "y = 2\\sin(3x)", "description": "Wave pattern with amplitude 2"}]
        if any(w in text for w in ['pendulum', 'swing']):
            return [{"latex": "y = 3\\cos(2x)", "description": "Pendulum oscillation pattern"}]
        if any(w in text for w in ['profit', 'revenue', 'cost']):
            return [{"latex": "y = -0.1x^2 + 5x - 10", "description": "Profit function with maximum"}]
        if any(w in text for w in ['supply', 'demand']):
            return [{"latex": "y = 0.5x + 2", "description": "Supply curve (upward sloping)"}] if 'supply' in text else [{"latex": "y = -0.3x + 8", "description": "Demand curve (downward sloping)"}]
        if any(w in text for w in ['growth', 'population', 'bacteria']):
            return [{"latex": "y = 2^{0.5x}", "description": "Exponential growth model"}]
        if any(w in text for w in ['decay', 'radioactive', 'half-life']):
            return [{"latex": "y = 10 \\cdot 2^{-0.3x}", "description": "Exponential decay model"}]
        if any(w in text for w in ['circle', 'round']):
            if 'small' in text:
                return [{"latex": "x^2 + y^2 = 4", "description": "Small circle with radius 2"}]
            if any(w in text for w in ['large', 'big']):
                return [{"latex": "x^2 + y^2 = 36", "description": "Large circle with radius 6"}]
            return [{"latex": "x^2 + y^2 = 9", "description": "Circle with radius 3"}]
        if any(w in text for w in ['ellipse', 'oval']):
            return [{"latex": "\\frac{x^2}{9} + \\frac{y^2}{4} = 1", "description": "Ellipse with semi-major axis 3"}]
        if any(w in text for w in ['hyperbola']):
            return [{"latex": "\\frac{x^2}{4} - \\frac{y^2}{9} = 1", "description": "Hyperbola with center at origin"}]
        if 'sine' in text or 'sin' in text:
            if any(w in text for w in ['high', 'big', 'large']) and 'amplitude' in text:
                return [{"latex": "y = 4\\sin(x)", "description": "Sine wave with amplitude 4"}]
            if any(w in text for w in ['fast', 'quick', 'high']) and 'frequency' in text:
                return [{"latex": "y = \\sin(3x)", "description": "Sine wave with frequency 3"}]
            return [{"latex": "y = \\sin(x)", "description": "Standard sine wave"}]
        if 'cos' in text or 'cosine' in text:
            return [{"latex": "y = \\cos(x)", "description": "Standard cosine wave"}]
        if 'tan' in text or 'tangent' in text:
            return [{"latex": "y = \\tan(x)", "description": "Tangent function"}]
        if 'parabola' in text or 'quadratic' in text:
            return [{"latex": "y = -x^2", "description": "Downward opening parabola"}] if 'down' in text else [{"latex": "y = x^2", "description": "Upward opening parabola"}]
        if 'cubic' in text:
            return [{"latex": "y = x^3", "description": "Cubic function"}]
        if any(w in text for w in ['absolute', 'abs', 'v-shape']):
            return [{"latex": "y = |x|", "description": "Absolute value function (V-shape)"}]
        if any(w in text for w in ['sqrt', 'square root']):
            return [{"latex": "y = \\sqrt{x}", "description": "Square root function"}]
        if any(w in text for w in ['exponential', 'exp']):
            return [{"latex": "y = 2^x", "description": "Exponential function with base 2"}]
        if any(w in text for w in ['log', 'logarithm']):
            return [{"latex": "y = \\ln(x)", "description": "Natural logarithm function"}]
        if any(w in text for w in ['line', 'linear']):
            return [{"latex": "y = x", "description": "Linear function with slope 1"}]
        return [
            {"latex": "y = x^2", "description": "Standard parabola"},
            {"latex": "y = \\sin(x)", "description": "Sine wave"}
        ]

    @classmethod
    def generate_math_expressions(cls, user_input: str):
        if not cls.PERPLEXITY_API_KEY:
            return cls.get_comprehensive_fallback_equations(user_input)

        enhanced_prompt = cls.categorize_and_enhance_prompt(user_input)
        headers = {"Authorization": f"Bearer {cls.PERPLEXITY_API_KEY}", "Content-Type": "application/json"}
        data = {
            "model": "r1-1776",
            "messages": [
                {"role": "system", "content": cls.ENHANCED_SYSTEM_PROMPT},
                {"role": "user", "content": enhanced_prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }

        try:
            resp = requests.post(cls.PERPLEXITY_BASE_URL, headers=headers, json=data, timeout=45)
            if resp.status_code != 200:
                return cls.get_comprehensive_fallback_equations(user_input)

            result = resp.json()
            llm_response = result['choices'][0]['message']['content']
            equations = cls.extract_advanced_json_from_response(llm_response)

            if equations and cls.validate_enhanced_equations(equations):
                valid = []
                for eq in equations[:2]:
                    if isinstance(eq, dict) and 'latex' in eq and 'description' in eq:
                        if cls.is_graphable_equation(eq['latex']):
                            valid.append(eq)
                if valid:
                    return valid
            return cls.get_comprehensive_fallback_equations(user_input)
        except requests.RequestException:
            return cls.get_comprehensive_fallback_equations(user_input)
