import os
from datetime import date, datetime, timedelta

class FileService:
    UPLOAD_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'notes'))

    @staticmethod
    def rename_file(subject: str, date_string: str) -> str:
        """Generate filename with date suffix"""
        if date_string == "today":
            formatted_date = date.today().strftime("%d%m%Y")
        elif date_string == "yesterday":
            formatted_date = (date.today() - timedelta(days=1)).strftime("%d%m%Y")
        else:
            try:
                dt = datetime.strptime(date_string, "%Y-%m-%d")
                formatted_date = dt.strftime("%d%m%Y")
            except ValueError:
                formatted_date = date.today().strftime("%d%m%Y")

        subject = (subject or "").replace(" ", "")
        return f"{subject}_{formatted_date}.pdf"

    @classmethod
    def ensure_subject_dir(cls, course: str, semester: str, subject: str) -> str:
        """Ensure directory structure exists"""
        save_dir = os.path.join(cls.UPLOAD_ROOT, course, semester, (subject or "").replace(" ", ""))
        os.makedirs(save_dir, exist_ok=True)
        return save_dir

    @classmethod
    def save_uploaded_file(cls, uploaded_file, subject: str, date_string: str, course: str, semester: str) -> str:
        """Save uploaded file with proper naming"""
        filename = cls.rename_file(subject, date_string)
        save_dir = cls.ensure_subject_dir(course, semester, subject)
        file_path = os.path.join(save_dir, filename)
        uploaded_file.save(file_path)
        return filename

    @classmethod
    def list_subject_files(cls, course: str, semester: str, subject: str) -> list:
        """List all files in a subject folder"""
        subject_folder = os.path.join(cls.UPLOAD_ROOT, course, semester, (subject or "").replace(" ", ""))
        if not os.path.exists(subject_folder):
            return []
        
        files = []
        for filename in os.listdir(subject_folder):
            if filename.endswith(('.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx')):
                file_path = os.path.join(subject_folder, filename)
                file_stats = os.stat(file_path)
                files.append({
                    'name': filename,
                    'size': file_stats.st_size,
                    'modified': datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                    'type': filename.split('.')[-1].upper()
                })
        
        # Sort by modification date (newest first)
        files.sort(key=lambda x: x['modified'], reverse=True)
        return [f['name'] for f in files]  # Return just names for compatibility

    @classmethod
    def get_subject_folder_path(cls, course: str, semester: str, subject: str) -> str:
        """Get the path to a subject folder"""
        return os.path.join(cls.UPLOAD_ROOT, course, semester, (subject or "").replace(" ", ""))

    @classmethod
    def get_total_notes_count(cls) -> int:
        """Get total count of all notes"""
        total = 0
        if os.path.exists(cls.UPLOAD_ROOT):
            for root, dirs, files in os.walk(cls.UPLOAD_ROOT):
                total += len([f for f in files if f.endswith(('.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'))])
        return total

    @classmethod
    def delete_file(cls, course: str, semester: str, subject: str, filename: str) -> bool:
        """Delete a specific file"""
        try:
            file_path = os.path.join(cls.get_subject_folder_path(course, semester, subject), filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False

    @classmethod
    def get_file_info(cls, course: str, semester: str, subject: str, filename: str) -> dict:
        """Get detailed information about a file"""
        try:
            file_path = os.path.join(cls.get_subject_folder_path(course, semester, subject), filename)
            if os.path.exists(file_path):
                stats = os.stat(file_path)
                return {
                    'name': filename,
                    'size': stats.st_size,
                    'modified': datetime.fromtimestamp(stats.st_mtime).isoformat(),
                    'created': datetime.fromtimestamp(stats.st_ctime).isoformat(),
                    'type': filename.split('.')[-1].upper(),
                    'path': file_path
                }
            return None
        except Exception:
            return None
