from typing import List, Dict, Optional

class GPAService:
    def __init__(self):
        self.grading_scale = {
            'A+': {'points': 4.0, 'min_percentage': 97, 'max_percentage': 100},
            'A': {'points': 4.0, 'min_percentage': 93, 'max_percentage': 96},
            'A-': {'points': 3.7, 'min_percentage': 90, 'max_percentage': 92},
            'B+': {'points': 3.3, 'min_percentage': 87, 'max_percentage': 89},
            'B': {'points': 3.0, 'min_percentage': 83, 'max_percentage': 86},
            'B-': {'points': 2.7, 'min_percentage': 80, 'max_percentage': 82},
            'C+': {'points': 2.3, 'min_percentage': 77, 'max_percentage': 79},
            'C': {'points': 2.0, 'min_percentage': 73, 'max_percentage': 76},
            'C-': {'points': 1.7, 'min_percentage': 70, 'max_percentage': 72},
            'D+': {'points': 1.3, 'min_percentage': 67, 'max_percentage': 69},
            'D': {'points': 1.0, 'min_percentage': 65, 'max_percentage': 66},
            'F': {'points': 0.0, 'min_percentage': 0, 'max_percentage': 64}
        }

    def get_grading_scale(self) -> Dict:
        """Get the grading scale"""
        return self.grading_scale

    def calculate_gpa(self, semesters: List[Dict]) -> Dict:
        """
        Calculate GPA from semester data
        Expected format:
        semesters = [
            {
                "name": "Semester 1",
                "subjects": [
                    {"name": "Math", "grade": "A", "credits": 3},
                    {"name": "Physics", "grade": "B+", "credits": 4}
                ]
            }
        ]
        """
        total_grade_points = 0
        total_credits = 0
        semester_gpas = []
        grade_distribution = {}
        
        for semester in semesters:
            semester_grade_points = 0
            semester_credits = 0
            semester_subjects = []
            
            for subject in semester.get('subjects', []):
                grade = subject.get('grade', '').upper()
                credits = subject.get('credits', 0)
                
                if grade in self.grading_scale and credits > 0:
                    grade_points = self.grading_scale[grade]['points']
                    subject_points = grade_points * credits
                    
                    semester_grade_points += subject_points
                    semester_credits += credits
                    total_grade_points += subject_points
                    total_credits += credits
                    
                    # Track grade distribution
                    if grade in grade_distribution:
                        grade_distribution[grade] += 1
                    else:
                        grade_distribution[grade] = 1
                    
                    semester_subjects.append({
                        'name': subject.get('name', ''),
                        'grade': grade,
                        'credits': credits,
                        'grade_points': grade_points,
                        'quality_points': subject_points
                    })
            
            semester_gpa = semester_grade_points / semester_credits if semester_credits > 0 else 0
            semester_gpas.append({
                'name': semester.get('name', ''),
                'gpa': round(semester_gpa, 3),
                'credits': semester_credits,
                'subjects': semester_subjects
            })
        
        overall_gpa = total_grade_points / total_credits if total_credits > 0 else 0
        
        return {
            'overall_gpa': round(overall_gpa, 3),
            'total_credits': total_credits,
            'total_grade_points': round(total_grade_points, 2),
            'semester_gpas': semester_gpas,
            'grade_distribution': grade_distribution,
            'academic_standing': self._get_academic_standing(overall_gpa),
            'graduation_eligibility': self._check_graduation_eligibility(overall_gpa, total_credits)
        }

    def predict_gpa(self, current_gpa: float, current_credits: int, future_courses: List[Dict], target_gpa: Optional[float] = None) -> Dict:
        """
        Predict future GPA based on planned courses
        future_courses = [
            {"name": "Course Name", "credits": 3, "expected_grade": "A"}
        ]
        """
        current_grade_points = current_gpa * current_credits
        
        # Calculate with future courses
        total_future_credits = sum(course.get('credits', 0) for course in future_courses)
        future_grade_points = 0
        
        scenarios = {}
        
        for course in future_courses:
            grade = course.get('expected_grade', '').upper()
            credits = course.get('credits', 0)
            
            if grade in self.grading_scale:
                grade_points = self.grading_scale[grade]['points']
                future_grade_points += grade_points * credits
        
        new_total_credits = current_credits + total_future_credits
        new_total_grade_points = current_grade_points + future_grade_points
        predicted_gpa = new_total_grade_points / new_total_credits if new_total_credits > 0 else current_gpa
        
        # Calculate different scenarios
        scenarios['optimistic'] = self._calculate_scenario(current_grade_points, current_credits, future_courses, 'A')
        scenarios['realistic'] = self._calculate_scenario(current_grade_points, current_credits, future_courses, 'B')
        scenarios['pessimistic'] = self._calculate_scenario(current_grade_points, current_credits, future_courses, 'C')
        
        result = {
            'current_gpa': current_gpa,
            'current_credits': current_credits,
            'predicted_gpa': round(predicted_gpa, 3),
            'new_total_credits': new_total_credits,
            'gpa_change': round(predicted_gpa - current_gpa, 3),
            'scenarios': scenarios,
            'improvement_suggestions': self._get_improvement_suggestions(current_gpa, predicted_gpa)
        }
        
        # Target GPA analysis
        if target_gpa:
            result['target_analysis'] = self._analyze_target_gpa(current_gpa, current_credits, target_gpa, future_courses)
        
        return result

    def _calculate_scenario(self, current_grade_points: float, current_credits: int, future_courses: List[Dict], scenario_grade: str) -> Dict:
        """Calculate GPA for a specific grade scenario"""
        total_future_credits = sum(course.get('credits', 0) for course in future_courses)
        scenario_grade_points = self.grading_scale[scenario_grade]['points']
        future_grade_points = scenario_grade_points * total_future_credits
        
        new_total_credits = current_credits + total_future_credits
        new_total_grade_points = current_grade_points + future_grade_points
        scenario_gpa = new_total_grade_points / new_total_credits if new_total_credits > 0 else 0
        
        return {
            'gpa': round(scenario_gpa, 3),
            'grade_assumed': scenario_grade,
            'description': f'If you get {scenario_grade} in all future courses'
        }

    def _analyze_target_gpa(self, current_gpa: float, current_credits: int, target_gpa: float, future_courses: List[Dict]) -> Dict:
        """Analyze what's needed to reach target GPA"""
        current_grade_points = current_gpa * current_credits
        total_future_credits = sum(course.get('credits', 0) for course in future_courses)
        new_total_credits = current_credits + total_future_credits
        
        required_total_grade_points = target_gpa * new_total_credits
        required_future_grade_points = required_total_grade_points - current_grade_points
        
        if total_future_credits > 0:
            required_average_grade_points = required_future_grade_points / total_future_credits
        else:
            required_average_grade_points = 0
        
        # Find the closest grade
        closest_grade = None
        min_diff = float('inf')
        
        for grade, info in self.grading_scale.items():
            diff = abs(info['points'] - required_average_grade_points)
            if diff < min_diff:
                min_diff = diff
                closest_grade = grade
        
        achievable = required_average_grade_points <= 4.0
        
        return {
            'target_gpa': target_gpa,
            'achievable': achievable,
            'required_average_grade_points': round(required_average_grade_points, 2),
            'closest_grade_needed': closest_grade,
            'recommendation': self._get_target_recommendation(achievable, required_average_grade_points, closest_grade)
        }

    def _get_academic_standing(self, gpa: float) -> str:
        """Determine academic standing based on GPA"""
        if gpa >= 3.8:
            return "Summa Cum Laude"
        elif gpa >= 3.6:
            return "Magna Cum Laude"
        elif gpa >= 3.4:
            return "Cum Laude"
        elif gpa >= 3.0:
            return "Good Standing"
        elif gpa >= 2.5:
            return "Satisfactory"
        elif gpa >= 2.0:
            return "Academic Warning"
        else:
            return "Academic Probation"

    def _check_graduation_eligibility(self, gpa: float, credits: int) -> Dict:
        """Check graduation eligibility"""
        min_gpa = 2.0
        min_credits = 120  # Typical requirement
        
        return {
            'eligible': gpa >= min_gpa and credits >= min_credits,
            'gpa_requirement_met': gpa >= min_gpa,
            'credits_requirement_met': credits >= min_credits,
            'min_gpa_required': min_gpa,
            'min_credits_required': min_credits,
            'credits_remaining': max(0, min_credits - credits)
        }

    def _get_improvement_suggestions(self, current_gpa: float, predicted_gpa: float) -> List[str]:
        """Get suggestions for GPA improvement"""
        suggestions = []
        
        if predicted_gpa < current_gpa:
            suggestions.append("Focus on maintaining your current performance level")
            suggestions.append("Consider retaking courses with low grades")
            suggestions.append("Seek tutoring for challenging subjects")
        elif predicted_gpa == current_gpa:
            suggestions.append("Maintain consistent study habits")
            suggestions.append("Consider taking additional courses to boost GPA")
        else:
            suggestions.append("Great improvement! Keep up the good work")
            suggestions.append("Consider challenging yourself with honors courses")
        
        if current_gpa < 3.0:
            suggestions.append("Meet with an academic advisor")
            suggestions.append("Utilize campus resources like study groups and tutoring")
            suggestions.append("Consider reducing course load to focus on quality")
        
        return suggestions

    def _get_target_recommendation(self, achievable: bool, required_points: float, closest_grade: str) -> str:
        """Get recommendation for reaching target GPA"""
        if not achievable:
            return "This target GPA is not achievable with the planned courses. Consider taking additional courses or adjusting your target."
        elif required_points >= 3.7:
            return f"You need to maintain excellent performance (mostly {closest_grade} grades) to reach this target."
        elif required_points >= 3.0:
            return f"You need to maintain good performance (around {closest_grade} grades) to reach this target."
        else:
            return f"This target is very achievable with consistent effort (around {closest_grade} grades)."
