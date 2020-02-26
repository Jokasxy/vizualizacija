import React, { Component } from 'react';
import { Input, Button, Form, Spin, Row, Col } from 'antd';
import { api } from './Api';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Legend } from 'recharts';
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
      loading: true
    }
  }

  componentDidMount()
  {
    api.get(`/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AMD&interval=yearly&apikey=${apikey}`)
    .then(response =>
    {
      let keys = Object.keys(response.data['Time Series (Daily)']);
      let values = Object.values(response.data['Time Series (Daily)']);
      for(let i = values.length - 1; i >= 0; i--)
      {
        this.setState(prevState => ({data: [...prevState.data, {date: keys[i], close: values[i]['4. close']}]}));
      }
    })
    .finally(() => this.setState({loading: false}));
  }

  handleSubmit = event =>
  {
    event.preventDefault();
    this.props.form.validateFields((error, values) =>
    {
      if(!error)
      {
        this.setState({loading: true});
        api.get(`/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${values.symbol}&interval=yearly&apikey=${apikey}`)
        .then(response =>
        {
          let keys = Object.keys(response.data['Time Series (Daily)']);
          let values = Object.values(response.data['Time Series (Daily)']);
          for(let i = values.length - 1; i >= 0; i--)
          {
            this.setState(prevState => ({data: [...prevState.data, {date: keys[i], close: values[i]['4. close']}]}));
          }
        })
        .finally(() => this.setState({loading: false}));
      }
    })
  }

  render()
  {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className='App'>
        <h1 style={{ marginBottom: '40px' }}>Stock market analysis</h1>
        <Form onSubmit={this.handleSubmit} layout="vertical">
          <Row style={{ marginBottom: '40px' }} gutter={[20, 20]}>
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
        </Form>
        {
          this.state.loading ? <Spin/> :
          <div style={{ overflow: 'auto' }}>
            <LineChart style={{ margin: '0 auto' }} width={800} height={400} data={this.state.data}>
              <XAxis dataKey={'date'}/>
              <YAxis/>
              <CartesianGrid stroke='#eee' strokeDasharray='5 5'/>
              <Legend verticalAlign='bottom'/>
              <Line type='monotone' dataKey='close' stroke='red' name='AMD' dot={false}/>
            </LineChart>
          </div>
        }
      </div>
    );
  }
}

export default Form.create({ name: 'symbolInput' })(App);
