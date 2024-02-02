//@ts-nocheck
import { KPIBlock, KPIText } from "../components/kpi-component";
import styles from "../styles/kpi-block.module.less";
import TICKIcon from "../assets/svgs/tick.svg?react";
import EpsilonLogo from "../assets/images/epsilon-logo.png";
import { useEffect, useState, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import cancelButton from "../assets/images/cancel.png";
import { useTokenStore } from "../store/store";
import { STAGES } from "../lib/constants";
import { Chart, registerables } from "chart.js";

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
} from "chart.js";

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

const bodyStyle = {
  background: "#eff2f7",
};

const chartStyle = {
  background: "#eff2f7",
  borderRadius: "8px",
  width: "fit-content",
  height: "fit-content",
};

const headerStyle = {
  padding: "10px",
  borderBottom: "1px solid #cdcdcd",
  fontFamily: "sans-serif",
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
  const [focused, setFocused] = useState<"all" | "you">("all");
  const [isLoading, setLoading] = useState(true);
  const token = useTokenStore((state) => state.token);
  const [dealData, setDealData] = useState<DealData[]>([]);
  const [accountHolderData, setAccountHolderData] = useState<
    AccountHolderData[]
  >([]);
  const [dealChartData, setDealChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedDeal, setSelectedDeal] = useState("");
  const [chartData, setChartData] = useState({});
  const [aggregatedKPIs, setAggregatedKPIs] = useState({
    totalOutreach: 0,
    deckRequested: 0,
    meetingRequested: 0,
    ddRequested: 0,
    passes: 0,
  });

  useEffect(() => {
    const fetchAggregatedKPIs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5002/total-outreach",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token, // if you're using authentication
            },
          }
        );
        setAggregatedKPIs(response.data);
      } catch (error) {
        console.error("Error fetching aggregated KPIs:", error);
      }
    };

    fetchAggregatedKPIs();
  }, []); // Empty dependency array means this effect runs once on mount

  const kpiChartData = {
    labels: [
      "Total Outreach",
      "Deck Requested",
      "Meeting Requested",
      "DD Requested",
    ],
    datasets: [
      {
        label: "KPIs",
        data: [
          aggregatedKPIs.totalOutreach,
          aggregatedKPIs.deckRequested,
          aggregatedKPIs.meetingRequested,
          aggregatedKPIs.ddRequested,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

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

  useEffect(() => {
    const fetchAggregatedKPIs = async () => {
      // Existing fetch logic...

      if (response.data) {
        const data = response.data;
        const differences = calculateDifferences([
          data.totalOutreach,
          data.deckRequested,
          data.meetingRequested,
          data.ddRequested,
        ]);
        // You might want to store the differences in the state or construct the chart data here
      }
    };

    fetchAggregatedKPIs();
  }, []);

  const calculateDifferences = (dataPoints) => {
    return dataPoints.slice(1).map((current, index) => {
      const previous = dataPoints[index];
      return (((previous - current) / previous) * 100).toFixed(1); // Calculate percentage difference
    });
  };

  Chart.register(...registerables);

  // Define a plugin to draw percentage differences
  const percentagePlugin = {
    id: "percentageDifferences",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const datasets = chart.data.datasets;

      if (chart.options.showPercentageDifferences) {
        if (datasets.length > 0) {
          const dataset = datasets[0]; // Assuming only one dataset
          const meta = chart.getDatasetMeta(0); // Meta data of the first (0 index) dataset

          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "black";

          for (let i = 1; i < dataset.data.length; i++) {
            const currentElement = meta.data[i];
            const previousElement = meta.data[i - 1];

            // Use getProps to get x and y values
            const { x: currentX, y: currentY } = currentElement.getProps(
              ["x", "y"],
              true
            );
            const { x: previousX, y: previousY } = previousElement.getProps(
              ["x", "y"],
              true
            );

            // Draw line between tops of bars
            ctx.beginPath();
            ctx.moveTo(previousX, previousY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = "#000"; // Line color
            ctx.stroke();

            // Calculate percentage difference
            const currentValue = dataset.data[i];
            const previousValue = dataset.data[i - 1];
            const percentageDifference = (
              ((currentValue - previousValue) / previousValue) *
              100
            ).toFixed(1);

            // Position the percentage text above the line
            const midX = (previousX + currentX) / 2;
            const midY = (previousY + currentY) / 2;

            // Adjust text position based on the slope of the line
            const slope = (currentY - previousY) / (currentX - previousX);
            const angle = Math.atan(slope);
            const yAdjustment = Math.cos(angle) * 10; // 10 is the distance above the line
            ctx.fillText(percentageDifference + "%", midX, midY - yAdjustment);
          }
        }
      }
    },
  };

  // Register the plugin
  Chart.register(percentagePlugin);

  //////////////////////////////////// Trying plot for "You" focus only on Tyler
  const [tylerKPIs, setTylerKPIs] = useState({
    totalOutreach: 0,
    deckRequested: 0,
    meetingRequested: 0,
    ddRequested: 0,
  });

  useEffect(() => {
    if (focused === "you") {
      const fetchTylerKPIs = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5002/account-holder-kpis/Tyler",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token, // Include this if you're using token-based auth
              },
            }
          );
          setTylerKPIs(response.data);
        } catch (error) {
          console.error("Error fetching KPIs for Tyler:", error);
        }
      };

      fetchTylerKPIs();
    }
  }, [focused]); // This effect runs when the 'focused' state changes

  function createChartDataFromKPIs(kpis) {
    return {
      labels: [
        "Total Outreach",
        "Deck Requested",
        "Meeting Requested",
        "DD Requested",
      ],
      datasets: [
        {
          label: "KPIs for Tyler",
          data: [
            kpis.totalOutreach,
            kpis.deckRequested,
            kpis.meetingRequested,
            kpis.ddRequested,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowAllFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch all clients
    const fetchClients = async () => {
      try {
        const response = await axios.get<string[]>(
          "http://localhost:5001/getClients",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const fetchCompanyData = async () => {
      const res = await axios.get("http://localhost:5001/fundrisingpipeline", {
        headers: {
          "Content-Type": "application/json",
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
        const stageVTasks = allTasks.filter(
          (task) =>
            task.pass_contacted === 1 ||
            task.pass_deck === 1 ||
            task.pass_meeting === 1 ||
            task.pass_dd === 1
        );
        setTasks({
          I: stageITasks,
          II: stageIITasks,
          III: stageIIITasks,
          IV: stageIVTasks,
          V: stageVTasks,
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
    width: "100%",
  };

  const tableContainerStyle = {
    display: "flex",
    justifyContent: "space-around",
    padding: "20px",
  };

  useEffect(() => {
    // Fetch the Data for Deals
    const fetchDealData = async () => {
      try {
        const response = await axios.get<DealData[]>(
          "http://localhost:5002/deals"
        );
        setDealData(response.data);
      } catch (error) {
        console.error("Error fetching deal data:", error);
      }
    };

    // Fetch the data for account holders
    const fetchAccountHolderData = async () => {
      try {
        const response = await axios.get<AccountHolderData[]>(
          "http://localhost:5002/account-holders"
        );
        setAccountHolderData(response.data);
      } catch (error) {
        console.error("Error fetching account holder data:", error);
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
    if (previous === 0) return "N/A"; // Handle division by zero
    return (((current - previous) / previous) * 100).toFixed(1) + "%";
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
        "Total Outreach",
        "Requested Deck",
        "Requested Meeting",
        "Requested DD",
      ],
      datasets: [
        {
          label: dealName,
          data: dataPoints,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
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

  // Chart options
  const chartOptionsEachDeal = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Assuming you don't need a legend
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            // Custom title to remove the default
            return "";
          },
          label: function (context) {
            // Display the label with value and percentage
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
          afterBody: function (context) {
            // Display the percentage change between bars in the tooltip
            const index = context[0].dataIndex;
            return index > 0
              ? `Change: ${chartData.percentages[index - 1]}`
              : "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide grid lines
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true, // Show grid lines for y-axis
        },
      },
    },
    // Additional options to match the screenshot style can be added here
  };

  useEffect(() => {
    // For Deal KPI Chart
    const chartLabels = dealData.map((item) => item.dealName);
    const totalOutreachData = dealData.map((item) => item.totalOutreach);
    // const newFundData = dealData.map((item) => item.newFund)
    // const respondOrNotData = dealData.map((item) => item.respondOrNot)
    const deckRequestedData = dealData.map((item) => item.deckRequested);
    const meetingRequestedData = dealData.map((item) => item.meetingRequested);
    const ddRequestedData = dealData.map((item) => item.ddRequested);

    setDealChartData({
      labels: chartLabels,
      datasets: [
        {
          label: "Total Outreach",
          data: totalOutreachData,
          backgroundColor: "rgba(255, 99, 132, 1)", // Brighter color
          barThickness: "flex", // Adjust bar thickness
        },
        {
          label: "Requested Deck",
          data: deckRequestedData,
          backgroundColor: "rgba(54, 162, 235, 1)", // Brighter color
          barThickness: "flex", // Adjust bar thickness
        },
        {
          label: "Requested Meeting",
          data: meetingRequestedData,
          backgroundColor: "rgba(255, 206, 86, 1)", // Brighter color
          barThickness: "flex", // Adjust bar thickness
        },
        {
          label: "Requested DD",
          data: ddRequestedData,
          backgroundColor: "rgba(0, 222, 55, 1)", // Brighter color
          barThickness: "flex", // Adjust bar thickness
        },
      ],
    });
  }, [dealData]); // This effect runs when dealData is set

  // Deal Chart Options
  const chartOptions = {
    indexAxis: "y", // For horizontal bar chart
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
        position: "right",
        labels: {
          color: "white", // Adjust to white color for visibility on black background
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Adjust to white color for visibility on black background
        },
      },
      y: {
        ticks: {
          color: "white", // Adjust to white color for visibility on black background
          autoSkip: false, // Ensure all labels are shown
          maxRotation: 0, // Prevent rotation of labels
          minRotation: 0,
        },
      },
    },
  };

  useEffect(() => {
    // Fetch the monthly totals data
    const fetchMonthlyTotals = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5002/monthly-totals"
        );
        setMonthlyTotals(response.data);
      } catch (error) {
        console.error("Error fetching monthly totals:", error);
      }
    };

    fetchMonthlyTotals();
  }, []); // Run once on component mount

  useEffect(() => {
    // For Monthly KPI Chart
    const chartLabels = monthlyTotals.map(
      (data) => `${data.month}/${data.year}`
    );
    const totalOutreachData = monthlyTotals.map((data) => data.totalOutreach);
    const totalNewFundData = monthlyTotals.map((data) => data.totalNewFund);
    const totalResponseData = monthlyTotals.map((data) => data.totalResponse);

    setMonthlyLineData({
      labels: chartLabels,
      datasets: [
        {
          label: "Total Outreach",
          data: totalOutreachData,
          borderColor: "rgb(0, 123, 255)", // Blue
          backgroundColor: "rgba(0, 123, 255, 0.5)", // Light blue
          fill: false,
          tension: 0.1,
        },
        {
          label: "Total New Fund",
          data: totalNewFundData,
          borderColor: "rgb(255, 193, 7)", // Orange
          backgroundColor: "rgba(255, 193, 7, 0.5)", // Light orange
          fill: false,
          tension: 0.1,
        },
        {
          label: "Total Response",
          data: totalResponseData,
          borderColor: "rgb(108, 117, 125)", // Gray
          backgroundColor: "rgba(108, 117, 125, 0.5)", // Light gray
          fill: false,
          tension: 0.1,
        },
      ],
    });
  }, [monthlyTotals]); // This effect runs when monthlyTotals is set

  // Monthly Chart Options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
        },
        title: {
          display: true,
          text: "Month",
          color: "#fff",
        },
      },
      y: {
        ticks: {
          color: "#fff",
        },
        title: {
          display: true,
          text: "Count",
          color: "#fff",
        },
      },
    },
  };

  // Helper function to transform the data into Chart.js format
  const transformDataForChart = (rawData) => {
    // Group data by account holders
    const dataByAccountHolder = rawData.reduce(
      (acc, { accountHolder, month, year, totalOutreach }) => {
        const monthYear = `${month}-${year}`;
        if (!acc[accountHolder]) {
          acc[accountHolder] = {
            label: accountHolder,
            data: [],
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.1,
          };
        }
        acc[accountHolder].data.push({ monthYear, totalOutreach });
        return acc;
      },
      {}
    );

    // Sort data by month-year for each account holder
    for (const holder of Object.keys(dataByAccountHolder)) {
      dataByAccountHolder[holder].data.sort(
        (a, b) => new Date(a.monthYear) - new Date(b.monthYear)
      );
    }

    // Create the labels (month-year) and datasets for the chart
    const labels = [
      ...new Set(rawData.map(({ month, year }) => `${month}-${year}`)),
    ].sort((a, b) => new Date(a) - new Date(b));
    const datasets = Object.values(dataByAccountHolder).map(
      (accountHolder) => ({
        label: accountHolder.label,
        data: labels.map((label) => {
          const entry = accountHolder.data.find(
            (entry) => entry.monthYear === label
          );
          return entry ? entry.totalOutreach : null;
        }),
        borderColor: accountHolder.borderColor,
        fill: accountHolder.fill,
        tension: accountHolder.tension,
      })
    );

    return { labels, datasets };
  };

  // Random color generator for the datasets
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // useEffect hook to fetch data and transform it for the chart
  useEffect(() => {
    const fetchAccountHolderKPIs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5002/account-holder-kpis"
        );
        const transformedData = transformDataForChart(response.data);
        setAccountHoldersLineData(transformedData);
      } catch (error) {
        console.error("Error fetching account holder KPIs:", error);
      }
    };

    fetchAccountHolderKPIs();
  }, []);

  // Helper function to transform the data into Chart.js format for the doughnut chart
  const transformDataForPieChart = (data) => {
    return {
      labels: data.map((item) => item.accountHolder),
      datasets: [
        {
          data: data.map((item) => item.totalOutreach),
          backgroundColor: data.map(() => getRandomColor()),
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    // Fetch the monthly totals data
    const fetchMonthlyTotals = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5002/monthly-totals"
        );
        setMonthlyTotals(response.data);
        // Here we create the combined chart data
        const chartData = createCombinedChartData(response.data);
        setCombinedChartData(chartData);
      } catch (error) {
        console.error("Error fetching monthly totals:", error);
      }
    };

    fetchMonthlyTotals();
  }, []); // Run once on component mount

  // Function to create combined chart data
  const createCombinedChartData = (data) => {
    const labels = data.map((item) => `${item.month}/${item.year}`);
    const totalOutreachData = data.map((item) => item.totalOutreach);
    const totalNewFundData = data.map((item) => item.totalNewFund);
    const totalResponseData = data.map((item) => item.totalResponse);
    const averageResponseData = data.map((item) => item.averageResponse);

    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Total Outreach",
          data: totalOutreachData,
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
        {
          type: "bar",
          label: "Total New Fund",
          data: totalNewFundData,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          type: "line",
          label: "Total Response",
          data: totalResponseData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          fill: true,
        },
        {
          type: "line",
          label: "Average Response",
          data: averageResponseData,
          borderColor: "rgba(255, 205, 86, 1)",
          backgroundColor: "rgba(255, 205, 86, 0.5)",
          fill: false,
        },
      ],
    };
  };

  const combinedChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const [category, setCategory] = useState<"dashboard" | "deal-funnel">(
    "dashboard"
  );
  const [tasks, setTasks] = useState({
    I: ["Fund Card I", "Fund Card II", "Fund Card III"],
    II: ["Fund Card IV", "Fund Card V", "Fund Card VI"],
    III: ["Fund Card VII", "Fund Card VIII", "Fund Card IX"],
    IV: ["Fund Card X", "Fund Card XI", "Fund Card XII"],
  });

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("task", task);
  };

  const handleDrop = (stage) => {
    return (e) => {
      const task = e.dataTransfer.getData("task");
      const originalStage = Object.keys(tasks).find((key) =>
        tasks[key].includes(task)
      );

      if (originalStage === stage) {
        return;
      }

      setTasks((prev) => ({
        ...prev,
        [stage]: [...prev[stage], task],
        [originalStage]: prev[originalStage].filter((t) => t !== task),
      }));
    };
  };
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [isLoading]);

  useEffect(() => {
    console.log(selectedClients);
  }, [selectedClients]);

  const data: any[] = [
    {
      name: "Total Outreach",
      value: aggregatedKPIs.totalOutreach,
      color: "#6f7aff",
    },
    {
      name: "Deck Requested",
      value: aggregatedKPIs.deckRequested,
      color: "#8e97ff",
    },
    {
      name: "Meeting Rquested",
      value: aggregatedKPIs.meetingRequested,
      color: "#5dbef2",
    },
    {
      name: "DD Requested",
      value: aggregatedKPIs.ddRequested,
      color: "#78ddea",
    },
  ];

  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      let height = 300;
      let width = 800;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      let scale = window.devicePixelRatio;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      let graphHeight = height - 100;

      let maxValue = Math.max.apply(
        Math,
        data.map(function (o) {
          return o.value;
        })
      );

      data.forEach((item) => {
        item["height"] = (item.value / maxValue) * graphHeight;
      });

      let boxes = data.length;
      ctx.strokeStyle = "#eee";
      for (let i = 0; i < boxes; i++) {
        let x = Math.round(i * (width / boxes));

        // draw separation lines
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0.5);
        ctx.lineTo(x + 0.5, height + 0.5);
        ctx.stroke();

        // draw item area
        ctx.fillStyle = data[i].color;
        ctx.beginPath();
        ctx.moveTo(x, height - 50 - data[i].height);
        ctx.lineTo(
          x + width / boxes + 0.5,
          height - 50 - (data[i + 1] ? data[i + 1].height : data[i].height)
        );
        ctx.lineTo(x + width / boxes + 0.5, height - 50);
        ctx.lineTo(x, height - 50);
        ctx.closePath();
        ctx.fill();

        // draw header
        ctx.font = "lighter 12px sans-serif";
        ctx.fillStyle = "#888888";
        ctx.fillText(data[i].name, x + 10, 20);

        ctx.font = "bolder 12px sans-serif";
        ctx.fillStyle = "#000";
        ctx.fillText(data[i].value, x + 10, 40);

        // draw footer
        if (i < boxes - 1) {
          ctx.font = "lighter 12px sans-serif";
          ctx.fillStyle = "#888888";
          ctx.fillText("Conversion Ratio  ---->", x + 10, height - 30);

          ctx.font = "bolder 12px sans-serif";
          ctx.fillStyle = "#777";
          // const text = (data[i+1].value - data[i].value) / data[i].value
          const percentageChange =
            (data[i + 1].value / data[i].value) * 100;
          const percentageString = "                                        "+ percentageChange.toFixed(2) + "%";
          ctx.fillText(percentageString, x + 10, height - 10);
        }
      }
    }
  }, []);

  return (
    <div
      className={styles["kpi-main"]}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "calc(10vh + 5rem)",
        gap: "3rem",
      }}
    >
      <div>
        <div className={styles["kpi-head"]} style={{}}>
          <img src={EpsilonLogo} className={styles["epsilon-logo"]} alt="" />
          <span className={styles["kpi-dashboard-text"]}>KPI Dashboard</span>
        </div>

        <div style={{ display: "flex", gap: "2rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <KPIBlock
              extraClass={styles["kpi-category"]}
              width={"21.625rem"}
              height={"13.625rem"}
            >
              <div
                className="kpi-category"
                onClick={() => setCategory("dashboard")}
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <TICKIcon
                  className={styles["tick-icon"]}
                  style={{
                    fill: category === "dashboard" ? "#2254ff" : "#fff",
                  }}
                />
                <KPIText fontSize={"1.25rem"} fontColor={"#fff"}>
                  Dashboard
                </KPIText>
              </div>
              <div
                className="kpi-category"
                onClick={() => setCategory("deal-funnel")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  justifyContent: "start",
                }}
              >
                <TICKIcon
                  className={styles["tick-icon"]}
                  style={{
                    fill: category === "deal-funnel" ? "#2254ff" : "#fff",
                  }}
                />
                <KPIText fontSize={"1.25rem"} fontColor={"#fff"}>
                  Deal Funnel
                </KPIText>
              </div>
            </KPIBlock>
            <KPIBlock
              extraClass={styles["kpi-filter"]}
              width="21.75rem"
              height="42.75rem"
            >
              <KPIText
                extraClass={styles["kpi-filter-text"]}
                fontColor="#fff"
                fontSize="1.8125rem"
              >
                Filters
              </KPIText>
              <KPIText extraClass={styles["kpi-filter-text-restore"]}>
                Restore default
              </KPIText>
              <KPIText
                extraClass={styles["kpi-filter-text-sub"]}
                fontColor="#fff"
                fontSize="1.5rem"
              >
                Timescale
              </KPIText>
              <ul className={styles["kpi-ul"]}>
                <li>today</li>
                <li>this week</li>
                <li>last week</li>
                <li>month to date</li>
                <li>year to date</li>
              </ul>
              <KPIText
                extraClass={styles["kpi-filter-text-sub"]}
                fontColor="#fff"
                fontSize="1.5rem"
              >
                Clients
              </KPIText>
              <div
                ref={filterRef}
                onClick={() => setShowAllFilters(true)}
                style={{ position: "relative", width: "100%" }}
              >
                <div
                  style={{
                    width: "85%",
                    maxHeight: "18rem",
                    overflowY: "auto",
                    background: "#12183499",
                    marginLeft: "1.5rem",
                    marginTop: "1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {selectedClients.map((selectedClient, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#fff5",
                        borderRadius: "0.125rem",
                        padding: "0.25rem",
                        margin: "0.25rem",
                      }}
                    >
                      <span style={{ textTransform: "uppercase" }}>
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
                        className={styles["client-cancel-button"]}
                        alt=""
                      />
                    </div>
                  ))}
                  <span style={{ fontSize: "1rem", padding: "0.5rem" }}>
                    Choose one or more client(s)
                  </span>
                </div>
                {showAllFilters && (
                  <ul
                    style={{
                      maxHeight: "20rem",
                      overflowY: "auto",
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "#12183499",
                      listStyleType: "none",
                      margin: "0 0 0 1.5rem",
                      padding: 0,
                      textAlign: "left",
                      width: "85%",
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
                            border: "0.5px #fff5 solid",
                            padding: "0.5rem",
                          }}
                        >
                          <span style={{ textTransform: "uppercase" }}>
                            {client}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </KPIBlock>
          </div>
          {category === "dashboard" ? (
            // <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  position: "absolute",
                  left: "2rem",
                  top: "-3rem",
                  zIndex: 255,
                }}
              >
                <button
                  className={
                    focused === "all"
                      ? styles["kpi-option-highlighted"]
                      : styles["kpi-option"]
                  }
                  onClick={() => {
                    setFocused("all");
                    setLoading(true);
                  }}
                >
                  All
                </button>
                <button
                  className={
                    focused === "you"
                      ? styles["kpi-option-highlighted"]
                      : styles["kpi-option"]
                  }
                  onClick={() => {
                    setFocused("you");
                    setLoading(true);
                  }}
                >
                  You
                </button>
              </div>
              <div className={styles["kpi-horizontal-layout"]}>
                <KPIBlock
                  extraClass={styles["kpi-mini-dashboard"]}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles["kpi-align-center-text"]}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Outreach
                  </KPIText>

                  <div className={styles["kpi-miniboard-horizontal-layout"]}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === "all" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.totalOutreach}
                        </KPIText>
                        <KPIText
                          fontColor={focused === "you" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles["kpi-mini-dashboard"]}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles["kpi-align-center-text"]}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Deck requests
                  </KPIText>
                  <div className={styles["kpi-miniboard-horizontal-layout"]}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === "all" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.deckRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === "you" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles["kpi-mini-dashboard"]}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles["kpi-align-center-text"]}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total meeting Requested
                  </KPIText>
                  <div className={styles["kpi-miniboard-horizontal-layout"]}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === "all" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.meetingRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === "you" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles["kpi-mini-dashboard"]}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles["kpi-align-center-text"]}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Total Due Dilligence
                  </KPIText>
                  <div className={styles["kpi-miniboard-horizontal-layout"]}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === "all" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.ddRequested}
                        </KPIText>
                        <KPIText
                          fontColor={focused === "you" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
                <KPIBlock
                  extraClass={styles["kpi-mini-dashboard"]}
                  width="17.5625rem"
                  height="8.25rem"
                >
                  <KPIText
                    extraClass={styles["kpi-align-center-text"]}
                    fontColor="#fff"
                    fontSize="0.9375rem"
                  >
                    Number of passes
                  </KPIText>
                  <div className={styles["kpi-miniboard-horizontal-layout"]}>
                    {isLoading ? (
                      <>
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                        <Skeleton
                          className={styles["kpi-text"]}
                          duration={2.0}
                          width={"4.5rem"}
                          height={"1.7rem"}
                        />
                      </>
                    ) : (
                      <>
                        <KPIText
                          fontColor={focused === "all" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          {aggregatedKPIs.passes}
                        </KPIText>
                        <KPIText
                          fontColor={focused === "you" ? "#fff" : "#817777"}
                          fontSize="1.875rem"
                        >
                          0
                        </KPIText>
                      </>
                    )}
                  </div>
                </KPIBlock>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <KPIText
                  fontColor="#fff"
                  fontSize="0.9375rem"
                  style={{ textAlign: "left" }}
                >
                  Deal Statistics
                </KPIText>
                <div
                  className={styles["kpi-horizontal-layout"]}
                  style={{ gap: "3rem" }}
                >
                  <KPIBlock
                    extraClass={styles["kpi-medium-dashboard"]}
                    width="52.25rem"
                    height="24.125rem"
                    style={{ overflow: "auto" }}
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
                    extraClass={styles["kpi-medium-dashboard"]}
                    width="60.25rem"
                    height="24.125rem"
                    style={{ overflow: "auto" }}
                  >
                    {/* Horizontal Bar Plot for Each Deal's KPI */}
                    <div style={{ height: "57rem", width: "55rem" }}>
                      <Bar data={dealChartData} options={chartOptions} />
                    </div>
                  </KPIBlock>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <KPIText
                  fontColor="#fff"
                  fontSize="0.9375rem"
                  style={{ textAlign: "left" }}
                >
                  Account Holder's KPI
                </KPIText>
                <div
                  className={styles["kpi-horizontal-layout"]}
                  style={{ gap: "3rem" }}
                >
                  <KPIBlock
                    extraClass={styles["kpi-medium-dashboard"]}
                    width="52.25rem"
                    height="24.125rem"
                    style={{ overflow: "auto" }}
                  >
                    {/* Account Holder Data Table */}
                    {/* <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th>Account Holder</th>
                          <th>Total Outreach</th>
                          <th>New Fund</th>
                          <th>Respond or Not</th>
                          <th>New Respond</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountHolderData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.accountHolder}</td>
                            <td>{item.totalOutreach}</td>
                            <td>{item.newFund}</td>
                            <td>{item.respondOrNot}</td>
                            <td>{item.newRespond}</td>
                          </tr>
                        ))}
                        <tr>
                          <td>Grand Total</td>
                          <td>
                            {accountHolderData.reduce(
                              (acc, item) => acc + item.totalOutreach,
                              0
                            )}
                          </td>
                          <td>
                            {accountHolderData.reduce(
                              (acc, item) => acc + item.newFund,
                              0
                            )}
                          </td>
                          <td>
                            {accountHolderData.reduce(
                              (acc, item) => acc + item.respondOrNot,
                              0
                            )}
                          </td>
                          <td>
                            {accountHolderData.reduce(
                              (acc, item) => acc + item.newRespond,
                              0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table> */}

                    {focused === "all" ? (
                      <div
                        style={{
                          width: "550px",
                          height: "600px",
                          padding: "20px",
                        }}
                      >
                        {/* <Bar data={kpiChartData} options={kpiChartOptions} /> */}
                        <div className="chart" style={chartStyle}>
                          <div className="header" style={headerStyle}>
                            Performance
                          </div>
                          <canvas ref={canvasRef}></canvas>{" "}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "550px",
                          height: "600px",
                          padding: "20px",
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
                    extraClass={styles["kpi-medium-dashboard"]}
                    width="60.25rem"
                    height="24.125rem"
                    style={{ overflow: "auto" }}
                  >
                    {/* Line Plot for Each Account Holder */}
                    {/* <div style={{ height: "21rem", width: "57rem" }}>
                      <Line
                        data={accountHoldersLineData}
                        options={lineChartOptions}
                      />
                    </div> */}
                    <div>
                      {/* Dropdown for selecting the deal */}
                      <select
                        value={selectedDeal}
                        onChange={handleSelectChange}
                      >
                        {dealData.map((deal, index) => (
                          <option key={index} value={deal.dealName}>
                            {deal.dealName}
                          </option>
                        ))}
                      </select>
                      {/* Chart component */}
                      {chartData && chartData.labels && (
                        <Bar
                          data={chartData}
                          options={{
                            // ... (other chart options)
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  afterBody: function (context) {
                                    // Display the percentage change between bars in the tooltip
                                    const index = context[0].dataIndex;
                                    return index > 0
                                      ? `Change: ${
                                          chartData.percentages[index - 1]
                                        }`
                                      : "";
                                  },
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </KPIBlock>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["funnel-layout"]}>
              {Object.keys(tasks).map((stage, index) => (
                <div
                  className={styles["stage-task-layout"]}
                  key={index}
                  onDrop={handleDrop(stage)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div
                    className={
                      index === 0
                        ? styles["stage-first-container"]
                        : styles["stage-container"]
                    }
                  >
                    {index === 0
                      ? "Stage"
                      : "\u00A0\u00A0\u00A0\u00A0\u00A0Stage"}{" "}
                    {stage}
                  </div>
                  {tasks[stage].map((deal, index) => (
                    <div
                      className={styles["task"]}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      key={index}
                    >
                      {deal}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
