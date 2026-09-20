/**
 * Macro Economic News & DXY Correlation Service
 * Tracks High Impact Economic Events (FOMC, CPI, NFP, GDP) and DXY (US Dollar Index) Live Correlation with Gold (XAUUSD).
 */

export const HIGH_IMPACT_EVENTS = [
  {
    id: 'fomc-1',
    title: 'FOMC Interest Rate Decision & Statement',
    country: 'USD',
    impact: 'HIGH',
    time: 'Today 14:00 EST',
    forecast: '5.25%',
    previous: '5.25%',
    goldImpact: 'BEARISH if Rate Hike / Hawkish | BULLISH if Rate Cut / Dovish',
    description: 'Federal Reserve interest rate decision. Higher rates boost DXY and push Gold prices down.'
  },
  {
    id: 'cpi-1',
    title: 'US Consumer Price Index (CPI MoM / YoY)',
    country: 'USD',
    impact: 'HIGH',
    time: 'Tomorrow 08:30 EST',
    forecast: '3.1%',
    previous: '3.3%',
    goldImpact: 'Hotter CPI $\rightarrow$ Rate Hike Fears $\rightarrow$ DXY Up $\rightarrow$ Gold Down',
    description: 'Inflation benchmark. Higher inflation forces Fed hawkishness, pressuring Gold.'
  },
  {
    id: 'nfp-1',
    title: 'US Non-Farm Payrolls (NFP Employment)',
    country: 'USD',
    impact: 'HIGH',
    time: 'Friday 08:30 EST',
    forecast: '175K',
    previous: '206K',
    goldImpact: 'Stronger Jobs $\rightarrow$ Stronger USD $\rightarrow$ Bearish Gold',
    description: 'Key employment metric driving Federal Reserve policy decisions.'
  },
  {
    id: 'gdp-1',
    title: 'US Quarterly Gross Domestic Product (GDP)',
    country: 'USD',
    impact: 'MEDIUM',
    time: 'In 3 Days',
    forecast: '2.8%',
    previous: '2.6%',
    goldImpact: 'Strong GDP boosts USD sentiment',
    description: 'Broadest measure of economic activity in the United States.'
  }
];

export class DXYTrackerService {
  constructor() {
    this.dxyPrice = 100.85;
    this.dxyChange = -0.32;
    this.correlation = -0.88; // Inverse correlation with Gold (typically -0.80 to -0.95)
    this.listeners = new Set();
    this.intervalId = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getData());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const data = this.getData();
    this.listeners.forEach(cb => cb(data));
  }

  getData() {
    return {
      dxyPrice: Number(this.dxyPrice.toFixed(2)),
      dxyChange: Number(this.dxyChange.toFixed(2)),
      correlation: Number(this.correlation.toFixed(2)),
      bias: this.dxyChange > 0.1 ? 'DXY Surging (BEARISH Gold Pressure)' : this.dxyChange < -0.1 ? 'DXY Crashing (BULLISH Gold Boost)' : 'DXY Neutral'
    };
  }

  startSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      // Simulate live tick fluctuations for DXY Index
      const delta = (Math.random() - 0.498) * 0.04;
      this.dxyPrice = Math.max(90, Math.min(115, this.dxyPrice + delta));
      this.dxyChange += delta;
      
      // Dynamic correlation coefficient slight fluctuation
      this.correlation = -0.85 + ((Math.random() - 0.5) * 0.08);

      this.notify();
    }, 2000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
