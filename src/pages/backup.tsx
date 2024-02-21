// @ts-nocheck
import { KPIBlock, KPIText } from '../components/kpi-component';
import styles from '../styles/kpi-block.module.less';
import TICKIcon from '../assets/svgs/tick.svg?react';
import EpsilonLogo from '../assets/images/epsilon-logo.png';
import { useEffect, useState, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import cancelButton from '../assets/images/cancel.png';
import { useTokenStore } from '../store/store';
import { STAGES } from '../lib/constants';
import { Chart, registerables } from 'chart.js';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import MemoizedDealFunnel from '../components/deal-funnel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartStyle = {
  // background: "#eff2f7",
  borderRadius: '8px',
  width: 'fit-content',
  height: 'fit-content',
};

const headerStyle = {
  padding: '10px',
  borderBottom: '1px solid #cdcdcd',
  fontFamily: 'sans-serif',
};

const bodyStyle2 = {
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
};

// Define the structure of the data for deals and account holders
interface DealData {
  dealName: string;
  totalOutreach: number;
  newFund: number;
  respondOrNot: number;
}

interface AccountHolderData {
  accountHolder: string;
  totalOutreach: number;
  newFund: number;
  respondOrNot: number;
  newRespond: number;
}

export default function KPIDash() {
  const filterRef = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showAllFilters, setShowAllFilters] = useState<boolean>(false);
  const [focused, setFocused] = useState<'all' | 'you'>('all');
  const [isLoading, setLoading] = useState(true);
  const token = useTokenStore((state) => state.token);
  const [dealData, setDealData] = useState<DealData[]>([]);
  const [timeDealData, setTimeDealData] = useState<DealData[]>([]);
  const [accountHolderData, setAccountHolderData] = useState<
    AccountHolderData[]
  >([]);
  const [dealChartData, setDealChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedDeal, setSelectedDeal] = useState('');
  const [chartData, setChartData] = useState({});
  const [aggregatedKPIs, setAggregatedKPIs] = useState({
    totalOutreach: 0,
    deckRequested: 0,
    meetingRequested: 0,
    ddRequested: 0,
    passes: 0,
  });
  const [timeScale, setTimeScale] = useState<
    'today' | 'this week' | 'last week' | 'month to date' | 'year to date'
  >('');

  useEffect(() => {
    const fetchAggregatedKPIs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5002/total-outreach',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token, // if you're using authentication
            },
          }
        );
        setAggregatedKPIs(response.data);
      } catch (error) {
        console.error('Error fetching aggregated KPIs:', error);
      }
    };

    fetchAggregatedKPIs();
  }, []); // Empty dependency array means this effect runs once on mount

  const kpiChartOptions = {
    showPercentageDifferences: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      percentageDifferences: {},
      legend: {
        display: false, // Set to true if you want a legend
      },
    },
  };

  /////////////// Trying plot for "You" focus only on Tyler ////////////////////
  const [tylerKPIs, setTylerKPIs] = useState({
    totalOutreach: 0,
    deckRequested: 0,
    meetingRequested: 0,
    ddRequested: 0,
  });

  useEffect(() => {
    if (focused === 'you') {
      const fetchTylerKPIs = async () => {
        try {
          const response = await axios.get(
            'http://localhost:5002/account-holder-kpis/Tyler',
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: token, // Include this if you're using token-based auth
              },
            }
          );
          setTylerKPIs(response.data);
        } catch (error) {
          console.error('Error fetching KPIs for Tyler:', error);
        }
      };

      fetchTylerKPIs();
    }
  }, [focused]);

  /////////////////////////////////////////////////////////////////////////////

  function createChartDataFromKPIs(kpis) {
    return {
      labels: [
        'Total Outreach',
        'Deck Requested',
        'Meeting Requested',
        'DD Requested',
      ],
      datasets: [
        {
          label: 'KPIs for Tyler',
          data: [
            kpis.totalOutreach,
            kpis.deckRequested,
            kpis.meetingRequested,
            kpis.ddRequested,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  const [tasks, setTasks] = useState({
    I: [],
    II: [],
    III: [],
    IV: [],
    V: [],
    VI: [],
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowAllFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch all clients
    const fetchClients = async () => {
      try {
        const response = await axios.get<string[]>(
          'http://localhost:5001/getClients',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
              'email': user?.email,
            },
          }
        );
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    const fetchCompanyData = async () => {
      const res = await axios.get('http://localhost:5001/fundrisingpipeline', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      });
      if (res.status === 200) {
        setLoading(false);
        const allTasks = res.data;
        const stageITasks = allTasks.filter((task) => task.contacted === 1);
        const stageIITasks = allTasks.filter((task) => task.deck_request === 1);
        const stageIIITasks = allTasks.filter(
          (task) => task.meeting_request === 1
        );
        const stageIVTasks = allTasks.filter((task) => task.dd === 1);
        const stageVTasks = allTasks.filter((task) => task.investments === 1);
        const stageVITasks = allTasks.filter(
          (task) =>
            task.pass_contacted === 1 ||
            task.pass_deck === 1 ||
            task.pass_meeting === 1 ||
            task.pass_dd === 1
        );

        // console.log(stageITasks)
        setTasks({
          I: stageITasks,
          II: stageIITasks,
          III: stageIIITasks,
          IV: stageIVTasks,
          V: stageVTasks,
          VI: stageVITasks,
        });
      }
    };

    fetchCompanyData();
    fetchClients();
  }, []);

  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [monthlyLineData, setMonthlyLineData] = useState({});
  const [accountHoldersLineData, setAccountHoldersLineData] = useState({
    labels: [],
    datasets: [],
  });
  const [combinedChartData, setCombinedChartData] = useState({});

  const tableStyle = {
    width: '100%',
  };

  useEffect(() => {
    // Fetch the Data for Deals
    const fetchDealData = async () => {
      try {
        const response = await axios.get<DealData[]>(
          'http://localhost:5002/deals'
        );
        setDealData(response.data);
      } catch (error) {
        console.error('Error fetching deal data:', error);
      }
    };

    // Fetch the data for account holders
    const fetchAccountHolderData = async () => {
      try {
        const response = await axios.get<AccountHolderData[]>(
          'http://localhost:5002/account-holders'
        );
        setAccountHolderData(response.data);
      } catch (error) {
        console.error('Error fetching account holder data:', error);
      }
    };

    // Fetch both datasets
    Promise.all([fetchDealData(), fetchAccountHolderData()]).then(() => {
      setLoading(false);
      // You can also set up chart data here if it depends on the fetched data
    });

    

    if (dealData.length > 0) {
      // Set the default selected deal to the one with the most outreach
      const sortedDeals = [...dealData].sort(
        (a, b) => b.totalOutreach - a.totalOutreach
      );
      setSelectedDeal(sortedDeals[0].dealName);
    }
  }, [dealData]);

  const handleSelectChange = (e) => {
    e.preventDefault(); // Prevent the default form behavior
    setSelectedDeal(e.target.value);
  };

  // Function to calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 'N/A'; // Handle division by zero
    return (((current - previous) / previous) * 100).toFixed(1) + '%';
  };

  const prepareChartData = (dealName) => {
    const deal = dealData.find((d) => d.dealName === dealName);
    if (!deal) return;

    const dataPoints = [
      deal.totalOutreach,
      deal.deckRequested,
      deal.meetingRequested,
      deal.ddRequested,
    ];

    const percentages = dataPoints
      .slice(1)
      .map((value, index) =>
        calculatePercentageChange(value, dataPoints[index])
      );

    setChartData({
      labels: [
        'Total Outreach',
        'Requested Deck',
        'Requested Meeting',
        'Requested DD',
      ],
      datasets: [
        {
          label: dealName,
          data: dataPoints,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
      percentages: percentages, // Store calculated percentages for later use
    });
  };

  useEffect(() => {
    if (selectedDeal) {
      prepareChartData(selectedDeal);
    }
  }, [selectedDeal, dealData]);

  useEffect(() => {
    // For Deal KPI Chart
    const chartLabels = dealData.map((item) => item.dealName);
    const totalOutreachData = dealData.map((item) => item.totalOutreach);
    const deckRequestedData = dealData.map((item) => item.deckRequested);
    const meetingRequestedData = dealData.map((item) => item.meetingRequested);
    const ddRequestedData = dealData.map((item) => item.ddRequested);

    setDealChartData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Total Outreach',
          data: totalOutreachData,
          backgroundColor: 'rgba(255, 99, 132, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
        {
          label: 'Requested Deck',
          data: deckRequestedData,
          backgroundColor: 'rgba(54, 162, 235, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
        {
          label: 'Requested Meeting',
          data: meetingRequestedData,
          backgroundColor: 'rgba(255, 206, 86, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
        {
          label: 'Requested DD',
          data: ddRequestedData,
          backgroundColor: 'rgba(0, 222, 55, 1)', // Brighter color
          barThickness: 'flex', // Adjust bar thickness
        },
      ],
    });
  }, [dealData]); // This effect runs when dealData is set

  // Deal Chart Options
  const chartOptions = {
    indexAxis: 'y', // For horizontal bar chart
    elements: {
      bar: {
        borderWidth: 1.5,
        // Set minimum bar thickness
        minBarLength: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Add this to maintain aspect ratio
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white', // Adjust to white color for visibility on black background
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', // Adjust to white color for visibility on black background
        },
      },
      y: {
        ticks: {
          color: 'white', // Adjust to white color for visibility on black background
          autoSkip: false, // Ensure all labels are shown
          maxRotation: 0, // Prevent rotation of labels
          minRotation: 0,
        },
      },
    },
  };

  //////////////////////// Line Plot for Each Account Holder ///////////////////
  // useEffect(() => {
  //   // Fetch the monthly totals data
  //   const fetchMonthlyTotals = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:5002/monthly-totals"
  //       );
  //       setMonthlyTotals(response.data);
  //     } catch (error) {
  //       console.error("Error fetching monthly totals:", error);
  //     }
  //   };

  //   fetchMonthlyTotals();
  // }, []); // Run once on component mount

  // // Monthly Chart Options
  // const lineChartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: "top",
  //       labels: {
  //         color: "#fff",
  //       },
  //     },
  //   },
  //   scales: {
  //     x: {
  //       ticks: {
  //         color: "#fff",
  //       },
  //       title: {
  //         display: true,
  //         text: "Month",
  //         color: "#fff",
  //       },
  //     },
  //     y: {
  //       ticks: {
  //         color: "#fff",
  //       },
  //       title: {
  //         display: true,
  //         text: "Count",
  //         color: "#fff",
  //       },
  //     },
  //   },
  // };
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////// Pie Plot for Each Account Holder ////////////////////
  // // Helper function to transform the data into Chart.js format
  // const transformDataForChart = (rawData) => {
  //   // Group data by account holders
  //   const dataByAccountHolder = rawData.reduce(
  //     (acc, { accountHolder, month, year, totalOutreach }) => {
  //       const monthYear = `${month}-${year}`;
  //       if (!acc[accountHolder]) {
  //         acc[accountHolder] = {
  //           label: accountHolder,
  //           data: [],
  //           borderColor: getRandomColor(),
  //           fill: false,
  //           tension: 0.1,
  //         };
  //       }
  //       acc[accountHolder].data.push({ monthYear, totalOutreach });
  //       return acc;
  //     },
  //     {}
  //   );

  //   // Sort data by month-year for each account holder
  //   for (const holder of Object.keys(dataByAccountHolder)) {
  //     dataByAccountHolder[holder].data.sort(
  //       (a, b) => new Date(a.monthYear) - new Date(b.monthYear)
  //     );
  //   }

  //   // Create the labels (month-year) and datasets for the chart
  //   const labels = [
  //     ...new Set(rawData.map(({ month, year }) => `${month}-${year}`)),
  //   ].sort((a, b) => new Date(a) - new Date(b));
  //   const datasets = Object.values(dataByAccountHolder).map(
  //     (accountHolder) => ({
  //       label: accountHolder.label,
  //       data: labels.map((label) => {
  //         const entry = accountHolder.data.find(
  //           (entry) => entry.monthYear === label
  //         );
  //         return entry ? entry.totalOutreach : null;
  //       }),
  //       borderColor: accountHolder.borderColor,
  //       fill: accountHolder.fill,
  //       tension: accountHolder.tension,
  //     })
  //   );

  //   return { labels, datasets };
  // };

  // // Random color generator for the datasets
  // const getRandomColor = () => {
  //   const letters = "0123456789ABCDEF";
  //   let color = "#";
  //   for (let i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // };

  // // useEffect hook to fetch data and transform it for the chart
  // useEffect(() => {
  //   const fetchAccountHolderKPIs = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:5002/account-holder-kpis"
  //       );
  //       const transformedData = transformDataForChart(response.data);
  //       setAccountHoldersLineData(transformedData);
  //     } catch (error) {
  //       console.error("Error fetching account holder KPIs:", error);
  //     }
  //   };

  //   fetchAccountHolderKPIs();
  // }, []);

  // // Helper function to transform the data into Chart.js format for the doughnut chart
  // const transformDataForPieChart = (data) => {
  //   return {
  //     labels: data.map((item) => item.accountHolder),
  //     datasets: [
  //       {
  //         data: data.map((item) => item.totalOutreach),
  //         backgroundColor: data.map(() => getRandomColor()),
  //         borderWidth: 1,
  //       },
  //     ],
  //   };
  // };
  //////////////////////////////////////////////////////////////////////////////

  const [category, setCategory] = useState<'dashboard' | 'deal-funnel'>(
    'dashboard'
  );

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [isLoading]);

  /////////////////////// Funnel Chart for Fund Raising Pipline /////////////////
  // const data: any[] = [
  //   {
  //     name: "Total Outreach",
  //     value: aggregatedKPIs.totalOutreach,
  //     color: "#6f7aff",
  //   },
  //   {
  //     name: "Deck Requested",
  //     value: aggregatedKPIs.deckRequested,
  //     color: "#8e97ff",
  //   },
  //   {
  //     name: "Meeting Rquested",
  //     value: aggregatedKPIs.meetingRequested,
  //     color: "#5dbef2",
  //   },
  //   {
  //     name: "DD Requested",
  //     value: aggregatedKPIs.ddRequested,
  //     color: "#78ddea",
  //   },
  // ];

  // const canvasRef = useRef(null);

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const canvas = canvasRef.current;
  //     const ctx = canvas.getContext("2d");
  //     const height = 300;
  //     const width = 800;
  //     canvas.style.width = width + "px";
  //     canvas.style.height = height + "px";

  //     const scale = window.devicePixelRatio;
  //     canvas.width = width * scale;
  //     canvas.height = height * scale;
  //     ctx.scale(scale, scale);

  //     const graphHeight = height - 100;

  //     const maxValue = Math.max.apply(
  //       Math,
  //       data.map(function (o) {
  //         return o.value;
  //       })
  //     );

  //     data.forEach((item) => {
  //       item["height"] = (item.value / maxValue) * graphHeight;
  //     });

  //     const boxes = data.length;
  //     ctx.strokeStyle = "#eee";
  //     for (let i = 0; i < boxes; i++) {
  //       const x = Math.round(i * (width / boxes));

  //       // draw separation lines
  //       ctx.beginPath();
  //       ctx.moveTo(x + 0.5, 0.5);
  //       ctx.lineTo(x + 0.5, height + 0.5);
  //       ctx.stroke();

  //       // draw item area
  //       ctx.fillStyle = data[i].color;
  //       ctx.beginPath();
  //       ctx.moveTo(x, height - 50 - data[i].height);
  //       ctx.lineTo(
  //         x + width / boxes + 0.5,
  //         height - 50 - (data[i + 1] ? data[i + 1].height : data[i].height)
  //       );
  //       ctx.lineTo(x + width / boxes + 0.5, height - 50);
  //       ctx.lineTo(x, height - 50);
  //       ctx.closePath();
  //       ctx.fill();

  //       // draw header
  //       ctx.font = "lighter 16px sans-serif";
  //       ctx.fillStyle = "#eee";
  //       ctx.fillText(data[i].name, x + 10, 20);

  //       ctx.font = "bolder 16x sans-serif";
  //       ctx.fillStyle = "#eee";
  //       ctx.fillText(data[i].value, x + 10, 40);

  //       // draw footer
  //       if (i < boxes - 1) {
  //         ctx.font = "lighter 16px sans-serif";
  //         ctx.fillStyle = "#fff";
  //         ctx.fillText("Conversion Ratio --->", x + 10, height - 30);

  //         ctx.font = "bolder 16px sans-serif";
  //         ctx.fillStyle = "#fff";
  //         // const text = (data[i+1].value - data[i].value) / data[i].value
  //         const percentageChange = (data[i + 1].value / data[i].value) * 100;
  //         const percentageString =
  //           "                           " + percentageChange.toFixed(2) + "%";
  //         ctx.fillText(percentageString, x + 10, height - 10);
  //       }
  //     }
  //   }
  // }, []);
  //////////////////////////////////////////////////////////////////////////////

  /////////////////////// The Two KPI Charts ///////////////////////////////////
  const filteredDealData = dealData;
  // .filter((item) => {
  //   return ["Remedium Bio", "Avivo Biomedical", "Lanier Therapeutics"].includes(
  //     item.dealName
  //   );
  // });

  const chartDivRef = useRef(null); // Ref for the first chart container
  const chartRef = useRef(null); // Ref for the second chart container
  const rootRef1 = useRef(null); // Ref to store the first Root instance
  const rootRef2 = useRef(null); // Ref to store the second Root instance

  useEffect(() => {
    if (chartDivRef.current && !rootRef1.current) {
      const root = am5.Root.new(chartDivRef.current);
      rootRef1.current = root;

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'panX',
          wheelY: 'zoomX',
          paddingLeft: 0,
          layout: root.verticalLayout,
        })
      );

      const data = [
        {
          stage: 'Total Outreach',
          income: aggregatedKPIs.totalOutreach,
          expenses: aggregatedKPIs.totalOutreach,
          change: 0,
        },
        {
          stage: 'Deck Requested',
          income: aggregatedKPIs.deckRequested,
          expenses: aggregatedKPIs.deckRequested,
          change: (
            (aggregatedKPIs.deckRequested / aggregatedKPIs.totalOutreach) *
            100
          ).toFixed(2),
        },
        {
          stage: 'Meeting Requested',
          income: aggregatedKPIs.meetingRequested,
          expenses: aggregatedKPIs.meetingRequested,
          change: (
            (aggregatedKPIs.meetingRequested / aggregatedKPIs.deckRequested) *
            100
          ).toFixed(2),
        },
        {
          stage: 'DD Requested',
          income: aggregatedKPIs.ddRequested,
          expenses: aggregatedKPIs.ddRequested,
          change: (
            (aggregatedKPIs.ddRequested / aggregatedKPIs.meetingRequested) *
            100
          ).toFixed(2),
        },
      ];

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'stage',
          renderer: am5xy.AxisRendererX.new(root, {
            minorGridEnabled: true,
            minGridDistance: 60,
          }),
        })
      );
      xAxis.data.setAll(data);
      xAxis.get('renderer').labels.template.setAll({
        fill: am5.color('#ffffff'), // White color for axis labels
      });
      xAxis.get('renderer').grid.template.setAll({
        stroke: am5.color('#ffffff'), // White color for grid lines
      });

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          extraMax: 0.1,
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );
      yAxis.get('renderer').labels.template.setAll({
        fill: am5.color('#ffffff'), // White color for axis labels
      });
      yAxis.get('renderer').grid.template.setAll({
        stroke: am5.color('#ffffff'), // White color for grid lines
      });

      const series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'income',
          categoryXField: 'stage',
        })
      );
      series1.data.setAll(data);

      const series2 = chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'expenses',
          categoryXField: 'stage',
        })
      );
      series2.data.setAll(data);

      series2.bullets.push((root, series, dataItem) => {
        const bullet = am5.Bullet.new(root, {
          locationX: 0.5,
          sprite: am5.Label.new(root, {
            text: '{change}%',
            fill: am5.color('#ffffff'),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });

        const value = dataItem.dataContext.change;
        if (value > 0) {
          bullet.get('sprite').setAll({
            fill: am5.color('#ffffff'), // white for positive change
          });
        } else {
          bullet.get('sprite').setAll({
            fill: am5.color('#ffffff'), // white for negative change
          });
        }

        return bullet;
      });

      chart.appear(1000, 100);
      series1.appear();

      return () => {
        root.dispose();
        rootRef1.current = null;
      };
    }
  }, [aggregatedKPIs, chartDivRef, rootRef1]);

  useEffect(() => {
    const disposeChart = () => {
      if (rootRef2.current) {
        rootRef2.current.dispose();
        rootRef2.current = null;
      }
    };

    if (chartRef.current && !rootRef2.current) {
      document.body.style = bodyStyle2;

      const root = am5.Root.new(chartRef.current);
      rootRef2.current = root;
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          paddingLeft: 0,
          wheelX: 'panX',
          wheelY: 'zoomX',
          layout: root.verticalLayout,
        })
      );

      chart.set('fontFamily', 'Arial');
      chart.setAll({ fill: am5.color(0xffffff) });

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          fill: am5.color(0xffffff),
        })
      );

      console.log('Selected Clients:', selectedClients); // Log selected clients

      const categories = [
        'totalOutreach',
        'deckRequested',
        'meetingRequested',
        'ddRequested',
      ];

      const data2 = categories.map((category) => {
        const entry = { year: category };
        selectedClients.forEach((clientName) => {
          const clientNameLower = clientName.toLowerCase();
          console.log('Client Name Lower:', clientNameLower); // Log lowercase client name
          const deal = filteredDealData.find(
            (deal) => deal.dealName.toLowerCase() === clientNameLower
          );
          console.log('Deal:', deal); // Log deal object
          if (deal) {
            const dealKey = deal.dealName; // Use the original case for dealKey
            // Directly use the category names without conversion, assuming they match the deal object properties
            entry[dealKey] = deal[category];
            console.log(`Value for ${dealKey} in ${category}:`, entry[dealKey]);
          }
        });
        return entry;
      });

      console.log('Data for Chart:', data2); // Log the structured data for the chart

      const xRenderer = am5xy.AxisRendererX.new(root, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
      });
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'year',
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
          fill: am5.color(0xffffff),
        })
      );

      xAxis
        .get('renderer')
        .labels.template.setAll({ fill: am5.color(0xffffff) });
      xAxis
        .get('renderer')
        .grid.template.setAll({ stroke: am5.color(0xffffff) });
      xAxis.data.setAll(data2);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        })
      );

      yAxis
        .get('renderer')
        .labels.template.setAll({ fill: am5.color(0xffffff) });
      yAxis
        .get('renderer')
        .grid.template.setAll({ stroke: am5.color(0xffffff) });

      selectedClients.forEach((clientName) => {
        const clientNameLower = clientName.toLowerCase();
        const deal = filteredDealData.find(
          (deal) => deal.dealName.toLowerCase() === clientNameLower
        );
        if (deal) {
          const dealKey = deal.dealName; // Use dealName from the deal object
          console.log('Client Name Display:', dealKey); // Log the dealKey used for series

          const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: dealKey, // Use dealKey for the series name
              xAxis: xAxis,
              yAxis: yAxis,
              valueYField: dealKey, // Use dealKey as valueYField
              categoryXField: 'year',
            })
          );

          series.columns.template.setAll({
            tooltipText: '{name}, {categoryX}:{valueY}',
            width: am5.percent(90),
            tooltipY: 0,
            strokeOpacity: 0,
            tooltipLabel: { fill: am5.color(0xffffff) },
          });

          series.data.setAll(data2);
          series.appear();
          series.bullets.push(() => {
            return am5.Bullet.new(root, {
              locationY: 0,
              sprite: am5.Label.new(root, {
                text: '{valueY}',
                fill: root.interfaceColors.get('alternativeText'),
                centerY: 0,
                centerX: am5.p50,
                populateText: true,
              }),
            });
          });

          legend.data.push(series);
        }
      });

      legend.labels.template.setAll({ fill: am5.color(0xffffff) });
      chart.appear(1000, 100);

      return () => {
        disposeChart();
      };
    }

    return () => {
      disposeChart();
    };
  }, [selectedClients]); // Only re-run the effect if selectedClients changes

  // useEffect(() => {
  //   const disposeChart = () => {
  //     if (rootRef2.current) {
  //       rootRef2.current.dispose();
  //       rootRef2.current = null;
  //     }
  //   };

  //   if (chartRef.current && !rootRef2.current) {
  //     document.body.style = bodyStyle2;

  //     const root = am5.Root.new(chartRef.current);
  //     rootRef2.current = root;
  //     root.setThemes([am5themes_Animated.new(root)]);

  //     const chart = root.container.children.push(
  //       am5xy.XYChart.new(root, {
  //         panX: false,
  //         panY: false,
  //         paddingLeft: 0,
  //         wheelX: "panX",
  //         wheelY: "zoomX",
  //         layout: root.verticalLayout,
  //       })
  //     );

  //     chart.set("fontFamily", "Arial");
  //     chart.setAll({ fill: am5.color(0xffffff) });

  //     const legend = chart.children.push(
  //       am5.Legend.new(root, {
  //         centerX: am5.p50,
  //         x: am5.p50,
  //         fill: am5.color(0xffffff),
  //       })
  //     );

  //     // Simplified test data
  //     let testData = [
  //       { year: "Total Outreach", antion: 245, lanier: 172, clarametyx: 46 },
  //       { year: "Deck Requested", antion: 37, lanier: 5, clarametyx: 5 },
  //       { year: "Meeting Requested", antion: 13, lanier: 0, clarametyx: 1 },
  //       {
  //         year: "Due Diligence Requested",
  //         antion: 4,
  //         lanier: 2,
  //         clarametyx: 0,
  //       },
  //     ];

  //     const xRenderer = am5xy.AxisRendererX.new(root, {
  //       cellStartLocation: 0.1,
  //       cellEndLocation: 0.9,
  //     });
  //     const xAxis = chart.xAxes.push(
  //       am5xy.CategoryAxis.new(root, {
  //         categoryField: "year",
  //         renderer: xRenderer,
  //         tooltip: am5.Tooltip.new(root, {}),
  //         fill: am5.color(0xffffff),
  //       })
  //     );

  //     xAxis
  //       .get("renderer")
  //       .labels.template.setAll({ fill: am5.color(0xffffff) });
  //     xAxis
  //       .get("renderer")
  //       .grid.template.setAll({ stroke: am5.color(0xffffff) });
  //     xAxis.data.setAll(testData);

  //     const yAxis = chart.yAxes.push(
  //       am5xy.ValueAxis.new(root, {
  //         renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
  //       })
  //     );

  //     yAxis
  //       .get("renderer")
  //       .labels.template.setAll({ fill: am5.color(0xffffff) });
  //     yAxis
  //       .get("renderer")
  //       .grid.template.setAll({ stroke: am5.color(0xffffff) });

  //     // Create series for each client based on simplified test data
  //     ["antion", "lanier", "clarametyx"].forEach((clientName) => {
  //       let series = chart.series.push(
  //         am5xy.ColumnSeries.new(root, {
  //           name: clientName,
  //           xAxis: xAxis,
  //           yAxis: yAxis,
  //           valueYField: clientName,
  //           categoryXField: "year",
  //         })
  //       );

  //       series.columns.template.setAll({
  //         tooltipText: "{name}, {categoryX}: {valueY}",
  //         width: am5.percent(90),
  //         tooltipY: 0,
  //         strokeOpacity: 0,
  //         tooltipLabel: { fill: am5.color(0xffffff) },
  //       });

  //       series.data.setAll(testData);
  //       series.appear();
  //       series.bullets.push(() => {
  //         return am5.Bullet.new(root, {
  //           locationY: 0,
  //           sprite: am5.Label.new(root, {
  //             text: "{valueY}",
  //             fill: root.interfaceColors.get("alternativeText"),
  //             centerY: 0,
  //             centerX: am5.p50,
  //             populateText: true,
  //           }),
  //         });
  //       });

  //       legend.data.push(series);
  //     });

  //     legend.labels.template.setAll({ fill: am5.color(0xffffff) });
  //     chart.appear(1000, 100);

  //     return () => {
  //       disposeChart();
  //     };
  //   }

  //   return () => {
  //     disposeChart();
  //   };
  // }, []); // Run this effect without dependencies to avoid re-running

  //////////////////////////////////////////////////////////////////////////////

  // function getDateRangeForTimeScale(timeScale) {
  //   const now = new Date();
  //   const today = new Date(
  //     now.getFullYear() ,
  //     now.getMonth(),
  //     now.getDate()
  //   ); // Reset hours, minutes, seconds, and milliseconds

  //   const getStartOfWeek = (date) => {
  //     const day = date.getDay();
  //     const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start from Monday
  //     return new Date(date.setDate(diff));
  //   };

  //   const startOfWeek = getStartOfWeek(new Date()); // Use a new Date object for each calculation
  //   const startOfLastWeek = new Date(startOfWeek);
  //   startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  //   const endOfLastWeek = new Date(startOfLastWeek);
  //   endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
  //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //   const startOfYear = new Date(today.getFullYear(), 0, 1);

  //   switch (timeScale) {
  //     case "today":
  //       return { startDate: formatDate(today), endDate: formatDate(today) };
  //     case "this week":
  //       return {
  //         startDate: formatDate(startOfWeek),
  //         endDate: formatDate(today),
  //       };
  //     case "last week":
  //       return {
  //         startDate: formatDate(startOfLastWeek),
  //         endDate: formatDate(endOfLastWeek),
  //       };
  //     case "month to date":
  //       return {
  //         startDate: formatDate(startOfMonth),
  //         endDate: formatDate(today),
  //       };
  //     case "year to date":
  //       return {
  //         startDate: formatDate(startOfYear),
  //         endDate: formatDate(today),
  //       };
  //     default:
  //       return { startDate: null, endDate: null }; // No filter
  //   }
  // }

  // function formatDate(date) {
  //   return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
  // }

  function getDateRangeForTimeScale(timeScale) {
    const now = new Date();
    // Subtract one year from the current date
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );

    // Use `oneYearAgo` to calculate other time scales
    const today = new Date(
      oneYearAgo.getFullYear(),
      oneYearAgo.getMonth(),
      oneYearAgo.getDate()
    ); // Reset hours, minutes, seconds, and milliseconds

    const getStartOfWeek = (date) => {
      const tempDate = new Date(date); // Create a new Date object to avoid modifying the original date
      const day = tempDate.getDay();
      const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start from Monday
      return new Date(tempDate.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(oneYearAgo);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
    const startOfMonth = new Date(
      oneYearAgo.getFullYear(),
      oneYearAgo.getMonth(),
      1
    );
    const startOfYear = new Date(oneYearAgo.getFullYear(), 0, 1);

    switch (timeScale) {
    case 'today':
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case 'this week':
      return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(today),
      };
    case 'last week':
      return {
        startDate: formatDate(startOfLastWeek),
        endDate: formatDate(endOfLastWeek),
      };
    case 'month to date':
      return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
      };
    case 'year to date':
      return {
        startDate: formatDate(startOfYear),
        endDate: formatDate(today),
      };
    default:
      return { startDate: null, endDate: null }; // No filter
    }
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
  }

  useEffect(() => {
    const fetchDealsData = async () => {
      const { startDate, endDate } = getDateRangeForTimeScale(timeScale);

      console.log(`Requesting deals data for timescale: ${timeScale}`);
      console.log(`Date range: ${startDate} to ${endDate}`);

      try {
        const response = await axios.get(
          'http://localhost:5002/deals/last-updated-status-dates',
          {
            params: {
              startDate, // No need to call .toISOString(), startDate and endDate are already strings
              endDate,
            },
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
          }
        );

        console.log(
          `Received ${response.data.length} deals for timescale: ${timeScale}`
        );
        console.log(`Data within the selected timescale:`, response.data);
        setTimeDealData(response.data);
      } catch (error) {
        console.error('Error fetching deal data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (timeScale) {
      setLoading(true);
      fetchDealsData();
    }
  }, [timeScale, token]);

  return (
    <div
      className={styles['kpi-main']}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '10vh',
        gap: '3rem',
      }}
    >
      <div>
        <div className={styles['kpi-head']} style={{}}>
          {/* <img src={EpsilonLogo} className={styles["epsilon-logo"]} alt="" /> */}
          <span className={styles['kpi-dashboard-text']}>KPI Dashboard</span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <KPIBlock
              extraClass={styles['kpi-category']}
              width={'21.625rem'}
              height={'13.625rem'}
            >
              <div
                className="kpi-category"
                onClick={() => setCategory('dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <TICKIcon
                  className={styles['tick-icon']}
                  style={{
                    fill: category === 'dashboard' ? '#2254ff' : '#fff',
                  }}
                />
                <KPIText fontSize={'1.25rem'} fontColor={'#fff'}>
                  Dashboard
                </KPIText>
              </div>
              <div
                className="kpi-category"
                onClick={() => setCategory('deal-funnel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  justifyContent: 'start',
                }}
              >
                <TICKIcon
                  className={styles['tick-icon']}
                  style={{
                    fill: category === 'deal-funnel' ? '#2254ff' : '#fff',
                  }}
                />
                <KPIText fontSize={'1.25rem'} fontColor={'#fff'}>
                  Deal Funnel
                </KPIText>
              </div>
            </KPIBlock>
            <KPIBlock
              extraClass={styles['kpi-filter']}
              width="21.75rem"
              height="42.75rem"
            >
              <KPIText
                extraClass={styles['kpi-filter-text']}
                fontColor="#fff"
                fontSize="1.8125rem"
              >
                Filters
              </KPIText>
              <KPIText extraClass={styles['kpi-filter-text-restore']}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeScale('');
                  }}
                >
                  Restore default
                </span>
              </KPIText>
              <KPIText
                extraClass={styles['kpi-filter-text-sub']}
                fontColor="#fff"
                fontSize="1.5rem"
              >
                Timescale
              </KPIText>
              <ul
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeScale(e.target.innerText);
                }}
                className={styles['kpi-ul']}
              >
                <li
                  key="today"
                  style={
                    timeScale === 'today'
                      ? { fontWeight: 600 }
                      : { fontWeight: 400 }
                  }
                >
                  today
                </li>
                <li
                  key="this week"
                  style={
                    timeScale === 'this week'
                      ? { fontWeight: 600 }
                      : { fontWeight: 400 }
                  }
                >
                  this week
                </li>
                <li
                  key="last week"
                  style={
                    timeScale === 'last week'
                      ? { fontWeight: 600 }
                      : { fontWeight: 400 }
                  }
                >
                  last week
                </li>
                <li
                  key="month to date"
                  style={
                    timeScale === 'month to date'
                      ? { fontWeight: 600 }
                      : { fontWeight: 400 }
                  }
                >
                  month to date
                </li>
                <li
                  key="year to date"
                  style={
                    timeScale === 'year to date'
                      ? { fontWeight: 600 }
                      : { fontWeight: 400 }
                  }
                >
                  year to date
                </li>
              </ul>
              <KPIText
                extraClass={styles['kpi-filter-text-sub']}
                fontColor="#fff"
                fontSize="1.5rem"
              >
                Clients
              </KPIText>
              <div
                ref={filterRef}
                onClick={() => setShowAllFilters(true)}
                style={{ position: 'relative', width: '100%' }}
              >
                <div
                  style={{
                    width: '85%',
                    maxHeight: '18rem',
                    overflowY: 'auto',
                    background: '#12183499',
                    marginLeft: '1.5rem',
                    marginTop: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  {selectedClients.map((selectedClient, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#fff5',
                        borderRadius: '0.125rem',
                        padding: '0.25rem',
                        margin: '0.25rem',
                      }}
                    >
                      <span style={{ textTransform: 'uppercase' }}>
                        {selectedClient}
                      </span>
                      <img
                        onClick={() =>
                          setSelectedClients(
                            selectedClients.filter(
                              (client) => client !== selectedClient
                            )
                          )
                        }
                        src={cancelButton}
                        className={styles['client-cancel-button']}
                        alt=""
                      />
                    </div>
                  ))}
                  <span style={{ fontSize: '1rem', padding: '0.5rem' }}>
                    Choose one or more client(s)
                  </span>
                </div>
                {showAllFilters && (
                  <ul
                    style={{
                      maxHeight: '20rem',
                      overflowY: 'auto',
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: '#12183499',
                      listStyleType: 'none',
                      margin: '0 0 0 1.5rem',
                      padding: 0,
                      textAlign: 'left',
                      width: '85%',
                    }}
                  >
                    {clients
                      .filter((clients) => !selectedClients.includes(clients))
                      .map((client, index) => (
                        <li
                          onClick={() =>
                            setSelectedClients([...selectedClients, client])
                          }
                          key={index}
                          style={{
                            border: '0.5px #fff5 solid',
                            padding: '0.5rem',
                          }}
                        >
                          <span style={{ textTransform: 'uppercase' }}>
                            {client}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </KPIBlock>
          </div>
          {category === 'dashboard' ? (
            // <div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  position: 'absolute',
                  left: '2rem',
                  top: '-3rem',
                  zIndex: 255,
                }}
              >
                <button
                  className={
                    focused === 'all'
                      ? styles['kpi-option-highlighted']
                      : styles['kpi-option']
                  }
                  onClick={() => {
                    setFocused('all');
                    setLoading(true);
                  }}
                >
                  All
                </button>
                <button
                  className={
                    focused === 'you'
                      ? styles['kpi-option-highlighted']
                      : styles['kpi-option']
                  }
                  onClick={() => {
                    setFocused('you');
                    setLoading(true);
                  }}
                >
                  You
                </button>
              </div>
              <div className={styles['kpi-horizontal-layout']}>
                <KPIBlock
                  extraClass={styles['kpi-mini-dashboard']}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles['kpi-align-center-text']}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Outreach
                  </KPIText>

                  <div className={styles['kpi-miniboard-horizontal-layout']}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === 'all' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.totalOutreach}
                        </KPIText>
                        <KPIText
                          fontColor={focused === 'you' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles['kpi-mini-dashboard']}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles['kpi-align-center-text']}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Deck requests
                  </KPIText>
                  <div className={styles['kpi-miniboard-horizontal-layout']}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === 'all' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.deckRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === 'you' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles['kpi-mini-dashboard']}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles['kpi-align-center-text']}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total meeting Requested
                  </KPIText>
                  <div className={styles['kpi-miniboard-horizontal-layout']}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === 'all' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.meetingRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === 'you' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles['kpi-mini-dashboard']}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles['kpi-align-center-text']}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Due Dilligence
                  </KPIText>
                  <div className={styles['kpi-miniboard-horizontal-layout']}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === 'all' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.ddRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === 'you' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles['kpi-mini-dashboard']}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles['kpi-align-center-text']}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Number of passes
                  </KPIText>
                  <div className={styles['kpi-miniboard-horizontal-layout']}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                        <Skeleton
                          className={styles['kpi-text']}
                          duration={2.0}
                          width={'4.5rem'}
                          height={'1.7rem'}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === 'all' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.passes}
                        </KPIText>
                        <KPIText
                          fontColor={focused === 'you' ? '#fff' : '#817777'}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <KPIText
                  fontColor="#fff"
                  fontSize="0.9375rem"
                  style={{ textAlign: 'left' }}
                >
                  Deal Statistics
                </KPIText>
                <div
                  className={styles['kpi-horizontal-layout']}
                  style={{ gap: '3rem' }}
                >
                  <KPIBlock
                    extraClass={styles['kpi-medium-dashboard']}
                    width="52.25rem"
                    height="24.125rem"
                    style={{ overflow: 'auto' }}
                  >
                    {/* Deal Data Table */}
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th>Deal Name</th>
                          <th>Total Outreach</th>
                          <th>New Fund</th>
                          <th>Respond or Not</th>
                          <th>Deck Requested</th>
                          <th>Meeting Requested</th>
                          <th>DD Requested</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dealData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.dealName}</td>
                            <td>{item.totalOutreach}</td>
                            <td>{item.newFund}</td>
                            <td>{item.respondOrNot}</td>
                            <td>{item.deckRequested}</td>
                            <td>{item.meetingRequested}</td>
                            <td>{item.ddRequested}</td>
                          </tr>
                        ))}
                        <tr>
                          <td>Grand Total</td>
                          <td>
                            {dealData.reduce(
                              (acc, item) => acc + item.totalOutreach,
                              0
                            )}
                          </td>
                          <td>
                            {dealData.reduce(
                              (acc, item) => acc + item.newFund,
                              0
                            )}
                          </td>
                          <td>
                            {dealData.reduce(
                              (acc, item) => acc + item.respondOrNot,
                              0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </KPIBlock>
                  <KPIBlock
                    extraClass={styles['kpi-medium-dashboard']}
                    width="60.25rem"
                    height="24.125rem"
                    style={{ overflow: 'auto' }}
                  >
                    {/* Horizontal Bar Plot for Each Deal's KPI */}
                    <div style={{ height: '57rem', width: '55rem' }}>
                      <Bar data={dealChartData} options={chartOptions} />
                    </div>
                  </KPIBlock>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <KPIText
                  fontColor="#fff"
                  fontSize="0.9375rem"
                  style={{ textAlign: 'left' }}
                >
                  Account Holder's KPI
                </KPIText>
                <div
                  className={styles['kpi-horizontal-layout']}
                  style={{ gap: '3rem' }}
                >
                  <KPIBlock
                    extraClass={styles['kpi-medium-dashboard']}
                    width="52.25rem"
                    height="26.125rem"
                    style={{ overflow: 'auto' }}
                  >
                    {focused === 'all' ? (
                      <div
                        style={{
                          width: '550px',
                          height: '600px',
                          padding: '20px',
                        }}
                      >
                        {/* <Bar data={kpiChartData} options={kpiChartOptions} /> */}
                        <div className="chart" style={chartStyle}>
                          <div className="header" style={headerStyle}>
                            {/* Performance */}
                          </div>
                          <div
                            ref={chartDivRef}
                            style={{ width: '700px', height: '350px' }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '550px',
                          height: '600px',
                          padding: '20px',
                        }}
                      >
                        <Bar
                          data={createChartDataFromKPIs(tylerKPIs)}
                          options={kpiChartOptions}
                        />
                      </div>
                    )}
                  </KPIBlock>
                  <KPIBlock
                    extraClass={styles['kpi-medium-dashboard']}
                    width="60.25rem"
                    height="26.125rem"
                    style={{ overflow: 'auto' }}
                  >
                    {/* Line Plot for Each Account Holder */}
                    {/* <div style={{ height: "21rem", width: "57rem" }}>
                      <Line
                        data={accountHoldersLineData}
                        options={lineChartOptions}
                      /> 
                    </div> */}
                    <div
                      ref={chartRef}
                      style={{ width: '900px', height: '400px' }}
                    ></div>
                  </KPIBlock>
                </div>
              </div>
            </div>
          ) : (
            <MemoizedDealFunnel
              selectedClients={selectedClients}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}
        </div>
      </div>
    </div>
  );
}
