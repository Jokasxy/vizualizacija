import React, { Component } from 'react';
import { Input, Button, Form, Spin, Row, Col, Empty, Radio, Card } from 'antd';
import { api } from './Api';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Legend, ResponsiveContainer, Tooltip } from 'recharts';
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
      data: [],
      loading: false,
      symbol: undefined
    }

    this.interval = localStorage.getItem('interval');
  }

  priceTooltip = ({active, payload, label}) =>
  {
    if (active) 
    {
      const percentage = ((payload[0]?.payload.prices['4. close'] / this.state.data[0].prices["4. close"] - 1) * 100).toFixed(2);
      return (
        <Card size='small'>
          <p style={{color: percentage >= 0 ? 'green' : 'red', fontWeight: 'bold'}}>{label}: {percentage}%</p>
          <p>1. open: {payload[0]?.payload.prices['1. open']}</p>
          <p>2. high: {payload[0]?.payload.prices['2. high']}</p>
          <p>3. low: {payload[0]?.payload.prices['3. low']}</p>
          <p style={{color: percentage >= 0 ? 'green' : 'red', fontWeight: 'bold'}}>4. close: {payload[0]?.payload.prices['4. close']}</p>
          <p>5. volume: {payload[0]?.payload.prices['5. volume']}</p>
        </Card>
      );
    }
    return null;
  };

  percentageTooltip = ({active, payload, label}) =>
  {
    if (active) 
    {
      const percentage = ((payload[0]?.payload.prices['4. close'] / this.state.data[0].prices["4. close"] - 1) * 100).toFixed(2);
      const daxPercantage = ((payload[0]?.payload.dax['4. close'] / this.state.data[0].dax["4. close"] - 1) * 100).toFixed(2);
      const spyPercantage = ((payload[0]?.payload.spy['4. close'] / this.state.data[0].spy["4. close"] - 1) * 100).toFixed(2);
      return (
        <Card size='small'>
          <p style={{color: (this.state.data[this.state.data.length - 1].prices["4. close"] / this.state.data[0].prices["4. close"]) >= 1 ? 'green' : 'red', fontWeight: 'bold'}}>
            {this.state.symbol.toUpperCase()}<br/>{label}: {percentage}% {payload[0]?.payload.prices['4. close']}
          </p>
          <p style={{color: 'purple', fontWeight: 'bold'}}>
            DAX<br/>{label}: {daxPercantage}% {payload[0]?.payload.dax['4. close']}
          </p>
          <p style={{color: 'blue', fontWeight: 'bold'}}>
            SPY<br/>{label}: {spyPercantage}% {payload[0]?.payload.spy['4. close']}
          </p>
        </Card>
      );
    }
    return null;
  };

  async fetchData(symbol, interval)
  {
    return api.get(`/query?function=${this.adjustInterval(interval)}&symbol=${symbol}&apikey=${apikey}`)
  }

  handleSubmit = event =>
  {
    event.preventDefault();
    this.props.form.validateFields((error, formValues) =>
    {
      if(!error)
      {
        this.setState({loading: true, data: [], symbol: formValues.symbol});
        this.fetchData(formValues.symbol, formValues.interval)
        .then(response =>
        {
          const data = Object.values(response.data)[1];
          if(data)
          {
            const keys = Object.keys(data);
            const values = Object.values(data);
            for(let i = values.length - 1; i >= 0; i--)
            {
              const referentTime = moment(keys[0]);
              const date = moment(keys[i]);
              switch(formValues.interval)
              {
                case 'intraday':
                  if(date.isSameOrAfter(referentTime, 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('HH:mm:ss'), prices: values[i]}]}));
                  }
                  break;
                case 'week':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'week'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD HH:mm:ss'), prices: values[i]}]}));
                  }
                  break;
                case 'month':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'month'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), prices: values[i]}]}));
                  }
                  break;
                case 'quarter':
                  if(date.isSameOrAfter(referentTime.subtract(3, 'months'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), prices: values[i]}]}));
                  }
                  break;
                case 'half-year':
                  if(date.isSameOrAfter(referentTime.subtract(6, 'months'), 'week'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), prices: values[i]}]}));
                  }
                  break;
                case 'year':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'year'), 'week'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), prices: values[i]}]}));
                  }
                  break;
                default:
                  this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD, YYYY'), prices: values[i]}]}));
              }
            }
          }
        })
        .then(() =>
        {
          this.fetchData('dax', formValues.interval)
          .then(response =>
          {
            const data = Object.values(response.data)[1];
            if(data)
            {
              const values = Object.values(data);
              let dax = this.state.data;
              for(let i = this.state.data.length - 1; i >= 0; i--)
              {
                dax[dax.length - 1 - i] = Object.assign({dax: values[i]}, dax[dax.length - 1 - i]);
              }
              this.setState({data: dax});
            }
          })
          this.fetchData('spy', formValues.interval)
          .then(response =>
          {
            const data = Object.values(response.data)[1];
            if(data)
            {
              const values = Object.values(data);
              let spy = this.state.data;
              for(let i = this.state.data.length - 1; i >= 0; i--)
              {
                spy[spy.length - 1 - i] = Object.assign({spy: values[i]}, spy[spy.length - 1 - i]);
              }
              this.setState({data: spy});
            }
          })
        })
        .finally(() =>
        {
          this.setState({loading: false});
          localStorage.setItem('interval', formValues.interval);
        });
      }
    })
  }

  adjustInterval(interval)
  {
    switch(interval)
    {
      case 'intraday':
        return 'TIME_SERIES_INTRADAY&interval=5min';
      case 'week':
        return 'TIME_SERIES_INTRADAY&interval=60min';
      case 'month': case 'quarter':
        return 'TIME_SERIES_DAILY';
      case 'half-year': case 'year':
        return 'TIME_SERIES_WEEKLY';
      default:
        return 'TIME_SERIES_INTRADAY&interval=5min';
    }
  }

  render()
  {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className='App'>
        <h1 style={{ marginBottom: '40px' }}>Stock market analysis</h1>
        <Form onSubmit={this.handleSubmit} layout="vertical">
          <Row gutter={[20, 20]}>
            <Col xs={16} sm={18} lg={20} xxl={21}>
              <Form.Item label='Input stock symbol'>
              {getFieldDecorator('symbol')(<Input size='large' placeholder='Stock symbol'/>)}
              </Form.Item>
            </Col>
            <Col xs={8} sm={6} lg={4} xxl={3}>
              <Form.Item label='&nbsp;'>
                <Button
                  style={{ float: 'right' }}
                  size='large'
                  type='primary' 
                  htmlType='submit' 
                  icon='search'
                  loading={this.state.loading}>
                  Search
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginBottom: '40px' }}>
            <Form.Item>
              {getFieldDecorator('interval', {initialValue: this.interval ?? 'intraday'})
              (<Radio.Group buttonStyle='solid'>
                <Radio.Button value='intraday'>
                  Intraday
                </Radio.Button>
                <Radio.Button value='week'>
                  Week
                </Radio.Button>
                <Radio.Button value='month'>
                  Month
                </Radio.Button>
                <Radio.Button value='quarter'>
                  Quarter
                </Radio.Button>
                <Radio.Button value='half-year'>
                  Half-Year
                </Radio.Button>
                <Radio.Button value='year'>
                  Year
                </Radio.Button>
              </Radio.Group>)}
            </Form.Item>
          </Row>
        </Form>
        {
          this.state.loading ? <Spin/> : this.state.data.length === 0 ? <Empty/> :
          <div className='chart-container'>
            <ResponsiveContainer>
              <LineChart data={this.state.data} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                <XAxis dataKey='date'/>
                <YAxis interval='preserveEnd' domain={['auto', 'auto']} type="number"/>
                <CartesianGrid stroke='#eee' strokeDasharray='5 5'/>
                <Legend verticalAlign='bottom'/>
                <Line /*type='monotone'*/ dataKey='prices["4. close"]'
                  stroke={(this.state.data[this.state.data.length - 1].prices["4. close"] / this.state.data[0].prices["4. close"]) >= 1 ? 'green' : 'red'}
                  name={this.state.symbol.toUpperCase()} dot={false}/>
                <Tooltip content={this.priceTooltip}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        }
        {
          this.state.data[this.state.data.length - 1]?.dax && this.state.data[this.state.data.length - 1]?.spy &&
          <div className='chart-container'>
            <ResponsiveContainer>
              <LineChart data={this.state.data} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                <XAxis dataKey='date'/>
                <YAxis interval='preserveEnd'/>
                <CartesianGrid stroke='#eee' strokeDasharray='5 5'/>
                <Legend verticalAlign='bottom'/>
                <Line /*type='monotone'*/ dataKey={data => (data.prices["4. close"] / this.state.data[0].prices["4. close"] - 1) * 100}
                  stroke={(this.state.data[this.state.data.length - 1].prices["4. close"] / this.state.data[0].prices["4. close"]) >= 1 ? 'green' : 'red'}
                  name={this.state.symbol.toUpperCase()} dot={false}/>
                <Line /*type='monotone'*/ dataKey={data => (data.dax["4. close"] / this.state.data[0].dax["4. close"] - 1) * 100}
                  stroke='purple' name='DAX' dot={false}/>
                <Line /*type='monotone'*/ dataKey={data => (data.spy["4. close"] / this.state.data[0].spy["4. close"] - 1) * 100}
                  stroke='blue' name='SPY' dot={false}/>
                <Tooltip content={this.percentageTooltip}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        }
      </div>
    );
  }
}

export default Form.create({ name: 'symbolInput' })(App);
