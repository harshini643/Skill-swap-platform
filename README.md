# Skill Swap Platform

## Problem Statement
The Skill Swap Platform is designed to facilitate the exchange of skills among users. It allows individuals to register, log in, offer or seek skills, create swap requests, provide feedback, and manage their profiles. The platform aims to connect people for skill-sharing in a secure and user-friendly manner.

## Team Members
- Kudupudi Sriharshini
- Akshaya Putti
- Barenkala Yojitha

## Backend Code
The backend is built using Python with Flask and SQLite, providing RESTful APIs for user management, skill handling, swap requests, and feedback. Below is the complete backend code:

## python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///skill_swap.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    photo = db.Column(db.String(200), nullable=True)
    availability = db.Column(db.String(100), nullable=True)
    is_public = db.Column(db.Boolean, default=True)
    role = db.Column(db.Enum('user', 'admin'), default='user')
    is_banned = db.Column(db.Boolean, default=False)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

class UserSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=False)
    type = db.Column(db.Enum('offered', 'wanted'), nullable=False)

class SwapRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    responder_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    offered_skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=False)
    wanted_skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=False)
    status = db.Column(db.Enum('pending', 'accepted', 'rejected', 'deleted'), default='pending')

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    swap_id = db.Column(db.Integer, db.ForeignKey('swap_request.id'), nullable=False)
    rater_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ratee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.Enum('user_activity', 'feedback_logs', 'swap_stats'), nullable=False)
    content = db.Column(db.JSON, nullable=False)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to Skill Swap Platform API'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    user = User(name=data['name'], email=data['email'], password=hashed_password, role=data.get('role', 'user'))
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered', 'id': user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        token = jwt.encode({'id': user.id, 'role': user.role, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, 'secret')
        return jsonify({'token': token, 'id': user.id, 'role': user.role})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/profile', methods=['GET'])
def profile():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        user = User.query.get(payload['id'])
        return jsonify({'id': user.id, 'name': user.name, 'email': user.email})
    except:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/skills', methods=['POST'])
def add_skill():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        data = request.get_json()
        skill = Skill.query.filter_by(name=data['name']).first()
        if not skill:
            skill = Skill(name=data['name'], description=data.get('description'))
            db.session.add(skill)
            db.session.commit()
        user_skill = UserSkill(user_id=payload['id'], skill_id=skill.id, type=data['type'])
        db.session.add(user_skill)
        db.session.commit()
        return jsonify({'message': 'Skill added'}), 201
    except:
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/skills/search', methods=['GET'])
def search_skills():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        query = request.args.get('query', '')
        skills = Skill.query.filter(Skill.name.ilike(f'%{query}%')).all()
        result = [{'id': s.id, 'name': s.name, 'description': s.description} for s in skills]
        return jsonify(result)
    except:
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/swaps', methods=['POST'])
def create_swap():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        data = request.get_json()
        swap = SwapRequest(requester_id=payload['id'], responder_id=data['responder_id'],
                          offered_skill_id=data['offered_skill_id'], wanted_skill_id=data['wanted_skill_id'])
        db.session.add(swap)
        db.session.commit()
        return jsonify({'message': 'Swap created', 'id': swap.id}), 201
    except:
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/swaps/<int:id>', methods=['PUT'])
def update_swap(id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        data = request.get_json()
        swap = SwapRequest.query.get_or_404(id)
        if swap.responder_id != payload['id']:
            return jsonify({'error': 'Not authorized'}), 403
        swap.status = data['status']
        db.session.commit()
        return jsonify({'message': f'Swap {data["status"]}'})
    except:
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/swaps/<int:id>', methods=['DELETE'])
def delete_swap(id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        swap = SwapRequest.query.get_or_404(id)
        if swap.requester_id != payload['id'] or swap.status != 'pending':
            return jsonify({'error': 'Not authorized'}), 403
        swap.status = 'deleted'
        db.session.commit()
        return jsonify({'message': 'Swap deleted'})
    except:
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/feedback', methods=['POST'])
def add_feedback():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token required'}), 401
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        data = request.get_json()
        swap = SwapRequest.query.get_or_404(data['swap_id'])
        if swap.requester_id != payload['id'] and swap.responder_id != payload['id']:
            return jsonify({'error': 'Not authorized'}), 403
        ratee_id = swap.requester_id if swap.responder_id == payload['id'] else swap.responder_id
        feedback = Feedback(swap_id=data['swap_id'], rater_id=payload['id'], ratee_id=ratee_id,
                           rating=data['rating'], comment=data.get('comment'))
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'message': 'Feedback added'}), 201
    except:
        return jsonify({'error': 'Invalid request'}), 400

if __name__ == '__main__':
    app.run(debug=True)
