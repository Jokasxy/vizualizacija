import React, { Component } from 'react';
import { Input, Button, Form, Spin, Row, Col, Empty, Radio } from 'antd';
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

  handleSubmit = event =>
  {
    event.preventDefault();
    this.props.form.validateFields((error, formValues) =>
    {
      if(!error)
      {
        this.setState({loading: true, data: [], symbol: formValues.symbol});
        api.get(`/query?function=${this.adjustInterval(formValues.interval)}&symbol=${formValues.symbol}&apikey=${apikey}`)
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
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('HH:mm:ss'), close: values[i]['4. close']}]}));
                  }
                  break;
                case 'week':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'week'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD HH:mm:ss'), close: values[i]['4. close']}]}));
                  }
                  break;
                case 'month':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'month'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), close: values[i]['4. close']}]}));
                  }
                  break;
                case 'quarter':
                  if(date.isSameOrAfter(referentTime.subtract(3, 'months'), 'day'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), close: values[i]['4. close']}]}));
                  }
                  break;
                case 'half-year':
                  if(date.isSameOrAfter(referentTime.subtract(6, 'months'), 'week'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), close: values[i]['4. close']}]}));
                  }
                  break;
                case 'year':
                  if(date.isSameOrAfter(referentTime.subtract(1, 'year'), 'week'))
                  {
                    this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD'), close: values[i]['4. close']}]}));
                  }
                  break;
                default:
                  this.setState(prevState => ({data: [...prevState.data, {date: date.format('MMM DD, YYYY'), close: values[i]['4. close']}]}));
              }
            }
          }
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
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
              <LineChart data={this.state.data}>
                <XAxis dataKey='date'/>
                <YAxis interval='preserveEnd'/>
                <CartesianGrid stroke='#eee' strokeDasharray='5 5'/>
                <Legend verticalAlign='bottom'/>
                <Line type='monotone' dataKey='close' stroke='red' name={this.state.symbol.toUpperCase()} dot={false}/>
                <Tooltip/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        }
      </div>
    );
  }
}

export default Form.create({ name: 'symbolInput' })(App);
