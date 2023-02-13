import './App.css';
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner'

function App() {
	const [startDate, setStartDate] = useState(new Date(2000, 0));
	const [endDate, setEndDate] = useState(new Date());
	const [genre, setGenre] = useState("");
	const [platform, setPlatform] = useState();
	const [playedList, setPlayedList] = useState([])
	const [excludedGames, setExcludedGames] = useState([])
	const [suggestion, setSuggestion] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	const sendPrompt = () =>{
		setError(false)
		setLoading(true)
		let payload = {
			start_year: startDate.getFullYear(),
			end_year: endDate.getFullYear(),
			genre: genre,
			platform: platform,
			played_games: playedList,
			excluded_games: excludedGames,
		}
		axios.post(process.env.REACT_APP_ENDPOINT_URL, payload).then(function (response) {
			setSuggestion(response.data)
			setExcludedGames([...excludedGames, response.data.game_title])
			setLoading(false)
		}).catch(function (error) {
			console.log(error);
			setError(true)
		});
	}

	const renderSuggestion = () =>{
		if(error){
			return <div className='error-container'>
				<p className='error-msg'>Seems like OpenAI is busy, can you wait a few seconds and try again?</p>
				<Button variant="outlined" onClick={sendPrompt} fullWidth>Try Again</Button>
			</div>
		}

		if(loading){
			return <ThreeDots 
					height="80" 
					width="80" 
					radius="9"
					color="#a3a3a3" 
					ariaLabel="three-dots-loading"
					wrapperStyle={{justifyContent: 'center'}}
					wrapperClassName=""
					visible={true}
					/>
		}
		if (suggestion)
			return <div className="suggestion-container">
				<div className='game-title'>
					<a href={suggestion.game_website} target="_blank" rel="noreferrer">{suggestion.game_title} (released on {suggestion.release_date})</a>
				</div>
				<div className='game-description'>{suggestion.game_description}</div>
				<Button variant="outlined" onClick={sendPrompt} fullWidth>I didn't like this, give me another one!</Button>
		</div>
	}

	return (
		<div className="form-container">	
			<h1 className='header'>Game Recommendations Powered by GPT3</h1>
			<p  className='intro'>This is a simple app to showcase Chat GPT3. Fill the form below and select a range for the release year, type the genre you want to play (rpg, first person shooter etc...), select the platform where you play and if you want, you can also give it a list of a few games you like to get a nice suggestion :) </p>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<div className='date-line'>
					<DatePicker
						views={['year']}
						label="Release Year Min"
						value={startDate}
						onChange={(e)=>{setStartDate(e)}}
						renderInput={(params) => <TextField fullWidth variant="standard" {...params} />}
					/>
					<DatePicker
						views={['year']}
						label="Release Year Max"
						value={endDate}
						onChange={setEndDate}
						renderInput={(params) => <TextField fullWidth variant="standard" {...params} />}
					/>
				</div>
				<TextField label="Genre" variant="standard" value={genre} onChange={(e)=>{setGenre(e.target.value)}} />
				<Select
					value={platform}
					label="Age"
					onChange={(e)=>{setPlatform(e.target.value)}}
				>
					<MenuItem value={'xbox'}>XBox</MenuItem>
					<MenuItem value={'playstation'}>Playstation</MenuItem>
					<MenuItem value={'pc'}>PC</MenuItem>
					<MenuItem value={'switch'}>Switch</MenuItem>
				</Select>
				<TextField
					label="Games Similar To"
					multiline
					onChange={(e)=>console.log(setPlayedList(e.target.value.split("\n")))}
					maxRows={4}
				/>
				<Button variant="contained" onClick={sendPrompt}>Get Recommendation!</Button>
			</LocalizationProvider>
			{renderSuggestion()}
		</div>
	);
}

export default App;
