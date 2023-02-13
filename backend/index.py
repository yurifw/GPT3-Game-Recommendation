from flask import Flask, request
from flask_cors import CORS
import os 
import requests
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
	return "Game recomendation API powered by Chat GPT3"

@app.route('/recommendation', methods=['POST'])
def generate_recommendation():
	body = request.json
	game_list = body['played_games']
	if len(game_list) > 1:
		game_list = ', '.join(body['played_games'][:-1])
		game_list = f" and similar to {game_list} and {body['played_games'][-1]}"
	else:
		game_list = "" if len(game_list)==0 else f"and similar to {game_list[0]}"

	excluded_games = body['excluded_games']
	if len(excluded_games) > 1:
		excluded_games = ', '.join(body['excluded_games'][:-1])
		excluded_games = f" I don't like {excluded_games} and {body['excluded_games'][-1]}."
	else:
		excluded_games = "" if len(excluded_games)==0 else f"I don't like {excluded_games[0]}"

	prompt = f"""
		Suggest a game released between {body['start_year']} and {body['end_year']} for {body['platform']}.
		The game must be from the genre {body['genre']}{game_list}.{excluded_games}
		Answer with a json with the keys 'game_title', 'release_date', 'game_description' and 'game_website'"""
	resp = requests.post('https://api.openai.com/v1/completions', headers={
		'Content-Type': 'application/json',
		'Authorization': f'Bearer {os.getenv("OPENAI_API_KEY")}'
	}, json={
		"model": "text-davinci-003",
		"prompt": prompt,
		"max_tokens": 256,
		"temperature": 0.3,
		"presence_penalty": 0.9
	})
	try:
		return json.loads(resp.text)['choices'][0]['text']
	except:
		return {'error':resp.text}