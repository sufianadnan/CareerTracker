/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import React, { useState, useEffect } from 'react';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, LineSeries, DateTime, Legend, Tooltip } from '@syncfusion/ej2-react-charts';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';

const LineChart = () => {
  const { currentColor, currentMode } = useStateContext();
  const [appliedDates, setAppliedDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/applied_dates');
        const dates = response.data.applied_dates;
        const dateCounts = dates.reduce((acc, dateStr) => {
          const [year, month, day] = dateStr.split('-');
          const date = new Date(year, month - 1, day);
          const dateKey = date.toISOString().split('T')[0];
          acc[dateKey] = (acc[dateKey] || 0) + 1;
          return acc;
        }, {});
        const data = Object.keys(dateCounts).map((dateKey) => {
          const [year, month, day] = dateKey.split('-');
          const date = new Date(year, month - 1, day);
          return { x: date, y: dateCounts[dateKey] };
        });
        data.sort((a, b) => a.x - b.x);
        setAppliedDates(data);
      } catch (error) {
        console.error('Error fetching applied dates:', error);
      }
    };
    fetchData();
  }, []);
  return (
    <ChartComponent
      id="line-chart"
      height="420px"
      primaryXAxis={{ valueType: 'DateTime' }}
      primaryYAxis={{ interval: 1, minimum: 0, maximum: Math.max(...appliedDates.map((data) => data.y)) + 1 }}
      chartArea={{ border: { width: 0 } }}
      tooltip={{ enable: true }}
      background={currentMode === 'Dark' ? '#181818' : '#fff'}
      legendSettings={{ background: 'white' }}
    >
      <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
      <SeriesCollectionDirective>
        <SeriesDirective
          dataSource={appliedDates}
          xName="x"
          yName="y"
          name="Times Applied"
          type="Line"
          fill={currentColor}
          marker={{ visible: true, width: 10, height: 10, fill: currentColor }}
        />
      </SeriesCollectionDirective>
    </ChartComponent>
  );
};

export default LineChart;
