import os
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your_very_secure_secret_key_change_this_in_production")

# Session configuration for security
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)  # Session timeout

# In-memory data storage
EMPLOYEES = [
    {
        "id": 1, "name": "نواف العتيبي", "email": "nawaf@gmail.com",
        "department": "d", "suntue": True, "wedthu": True, "frisat": False,
        "shift": "7am-3pm", "score": 90, "total": 120, "done": 110
    },
    {
        "id": 2, "name": "نواف خالد", "email": "nawaf22@gmail.com",
        "department": "e", "suntue": True, "wedthu": False, "frisat": False,
        "shift": "10am-6pm", "score": 75, "total": 64, "done": 50
    },
    {
        "id": 3, "name": "سارة المطيري", "email": "sara.m@org.sa",
        "department": "f", "suntue": False, "wedthu": True, "frisat": False,
        "shift": "7am-3pm", "score": 88, "total": 70, "done": 66
    },
    {
        "id": 4, "name": "عبدالله الشهري", "email": "abdullah.sh@org.sa",
        "department": "md", "suntue": False, "wedthu": True, "frisat": True,
        "shift": "10am-6pm", "score": 82, "total": 95, "done": 80
    },
    {
        "id": 5, "name": "ريم الأحمد", "email": "reem.ah@org.sa",
        "department": "d", "suntue": True, "wedthu": False, "frisat": True,
        "shift": "11am-2pm", "score": 92, "total": 40, "done": 36
    },
    {
        "id": 6, "name": "ياسر الحربي", "email": "yasser@org.sa",
        "department": "e", "suntue": False, "wedthu": False, "frisat": True,
        "shift": "10am-6pm", "score": 70, "total": 30, "done": 18
    },
    {
        "id": 7, "name": "نورة الدوسري", "email": "nora@org.sa",
        "department": "f", "suntue": True, "wedthu": True, "frisat": False,
        "shift": "7am-3pm", "score": 95, "total": 150, "done": 148
    }
]

# Email categories data
EMAIL_CATEGORIES = {
    "Organization": 45,
    "Lab": 23,
    "Request": 67,
    "Other": 12
}

# Demo credentials
DEMO_CREDENTIALS = {
    "username": "admin",
    "password": "password123",
    "email": "admin@org.sa",
    "link": "https://org.sa"
}

# System status
system_status = True

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session.get('logged_in'):
            return redirect(url_for('login'))
        
        # Check if session has expired
        if 'login_time' in session:
            login_time = datetime.fromisoformat(session['login_time'])
            if datetime.now() - login_time > timedelta(hours=2):
                session.clear()
                flash('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error')
                return redirect(url_for('login'))
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'logged_in' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Redirect if already logged in
    if 'logged_in' in session and session.get('logged_in'):
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        link = request.form.get('link')
        
        # Log the submitted payload
        payload = {
            'username': username,
            'password': password,
            'email': email,
            'link': link
        }
        print(f"Login payload: {payload}")
        
        # Validate against demo credentials
        if (username == DEMO_CREDENTIALS['username'] and
            password == DEMO_CREDENTIALS['password'] and
            email == DEMO_CREDENTIALS['email'] and
            link == DEMO_CREDENTIALS['link']):
            session.permanent = True
            session['logged_in'] = True
            session['user'] = username
            session['login_time'] = datetime.now().isoformat()
            return redirect(url_for('dashboard'))
        else:
            flash('بيانات الدخول غير صحيحة', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    
    # Calculate department statistics
    dept_stats = {'D': 0, 'F': 0, 'E': 0, 'MD': 0}
    for emp in EMPLOYEES:
        dept_stats[emp['department'].upper()] += 1
    
    return render_template('dashboard.html', 
                         email_categories=EMAIL_CATEGORIES,
                         dept_stats=dept_stats,
                         employees=EMPLOYEES,
                         system_status=system_status)

@app.route('/employees')
@login_required
def employees():
    
    return render_template('employees.html', employees=EMPLOYEES, system_status=system_status)

@app.route('/logout')
def logout():
    session.clear()
    flash('تم تسجيل الخروج بنجاح', 'success')
    return redirect(url_for('login'))

@app.route('/api/employees', methods=['GET'])
@login_required
def get_employees():
    return jsonify(EMPLOYEES)

@app.route('/api/employees', methods=['POST'])
@login_required
def update_employees():
    global EMPLOYEES
    EMPLOYEES = request.json
    return jsonify({'status': 'success'})

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
@login_required
def delete_employee(employee_id):
    global EMPLOYEES
    EMPLOYEES = [emp for emp in EMPLOYEES if emp['id'] != employee_id]
    return jsonify({'status': 'success'})

@app.route('/api/toggle', methods=['POST'])
@login_required
def toggle_setting():
    global system_status
    state = request.json.get('state', 'off')
    system_status = (state == 'on')
    print(f"Settings toggle: {state} - System status: {system_status}")
    return jsonify({'status': 'success', 'system_status': system_status})

if __name__ == '__main__':
    # For production, set debug=False
    app.run(host='0.0.0.0', port=5000, debug=True)
