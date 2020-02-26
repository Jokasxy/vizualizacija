import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { api } from './Api';
import { LineChart, XAxis, YAxis, CartesianGrid, Line } from 'recharts';
import moment from 'moment';
import './App.css';
import 'antd/dist/antd.css';

const apikey = 'GGQSQCREKP1PCWRF';

class App extends Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      data: []
    }
  }

  componentDidMount()
  {
    api.get(`/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AMD&interval=yearly&apikey=${apikey}`)
    .then(response =>
    {
      console.log(response.data['Time Series (Daily)']);
      let keys = Object.keys(response.data['Time Series (Daily)']);
      console.log(moment(keys[0])._i);
      console.log(moment(keys[0])._i['4. close']);
      for(let i = 0; i < response.data['Time Series (Daily)'].length; i++)
      {
        this.state.data.push({date: moment(keys[i]), close: moment(keys[i])['4. close']});
      }
    });

  }

  render()
  {
    return (
      <div className='App'>
        <h1>Stock market analysis</h1>
        <Input size='large' placeholder='Stock symbol'
        addonAfter={<Button type='primary' icon='search' style={{height: '38px', borderRadius: '0'}}/>}
        />
        <LineChart width={800} height={400} data={this.state.data}>
          <XAxis dataKey={Object.keys(this.state.data)}/>
          <YAxis/>
          <CartesianGrid stroke='#eee' strokeDasharray='5 5'/>
          <Line type='monotone' dataKey='4. close' stroke='#8884d8' />
        </LineChart>
      </div>
    );
  }
}

export default App;
