from flask import Flask, render_template, request, redirect, session, url_for, flash, abort
from flask_wtf import CSRFProtect
from jinja2 import TemplateNotFound
import csv
import json
import uuid
import datetime
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'please-change-this-to-a-secret')
csrf = CSRFProtect(app)

# CSV file stored next to app.py
DATA_CSV = os.path.join(os.path.dirname(__file__), 'data.csv')


@app.before_request
def ensure_user():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())


@app.route('/')
def index():
    return redirect(url_for('serve_page', page='stranky/dotaznik.html'))


def _save_form(form):
    # helper to write CSV row and handle role/session
    user_id = session.get('user_id') or str(uuid.uuid4())
    session['user_id'] = user_id

    page = form.get('page', '')
    timestamp = datetime.datetime.utcnow().isoformat()

    # collect only q* fields to keep CSV compact
    answers = {}
    for k in form.keys():
        if k.startswith('q'):
            vals = form.getlist(k)
            if len(vals) > 1:
                answers[k] = vals
            elif len(vals) == 1:
                answers[k] = vals[0]
            else:
                answers[k] = ''

    # save role to session if provided
    role = form.get('role')
    if role:
        session['role'] = role

    # append to CSV: timestamp, user_id, page, answers(JSON)
    os.makedirs(os.path.dirname(DATA_CSV) or '.', exist_ok=True)
    with open(DATA_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, user_id, page, json.dumps(answers, ensure_ascii=False)])

    # flash a short confirmation (template must render flashed messages)
    flash('Odpověď uložena')

    # decide redirect
    next_page = form.get('next')
    if next_page:
        return redirect(url_for('serve_page', page=next_page))
    if role:
        return redirect(url_for('serve_page', page=f'roleplay/{role}/1otazka.html'))
    if page:
        return redirect(url_for('serve_page', page=page))
    return redirect(url_for('index'))


@app.route('/save', methods=['POST'])
def save():
    return _save_form(request.form)


@app.route('/<path:page>', methods=['GET', 'POST'])
def serve_page(page):
    # accept GET and POST here; POST will call same saving logic if someone posts to page
    if request.method == 'POST':
        return _save_form(request.form)
    try:
        return render_template(page)
    except TemplateNotFound:
        abort(404)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
