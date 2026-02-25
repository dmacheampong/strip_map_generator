
import { Line } from "./Line";
import { Bullet } from "./Bullet";

export type StripMapProps = {
  ref: React.Ref<SVGSVGElement>;
  name: string;
  color: string;
  bulletText: string;
  bulletTextColor: string;
  stationsDict: Array<any>;
};

export function StripMap({ ref, name, color, bulletText, bulletTextColor, stationsDict }: StripMapProps) {
  /** Dimensions **/
  const spaceBetween = 60;
  const maxNumOfTransfers = Math.max(...stationsDict.map((station) => station.transfers.length));
  const lineLength = (stationsDict.length - 1) * spaceBetween;
  const contentWidth = lineLength * 1.25;
  const contentHeight = maxNumOfTransfers * 100;

  const boroughs: { id: number; current: string; next: string; numOfStations: number; pos: number }[] = [];
  let currentBorough = '';
  let stationCnt = 0;
  let pos = 0;

  for (let i = 0; i < stationsDict.length; i++) {
    const station = stationsDict[i];
    if ((station.borough !== currentBorough && currentBorough !== '') || i === stationsDict.length - 1) {
      if (i === stationsDict.length - 1) {
        stationCnt++;
      }

      pos += stationCnt;

      const borough = { 'id': boroughs.length, 'current': currentBorough, 'next': station.borough, 'numOfStations': stationCnt, 'pos': pos };
      boroughs.push(borough);
      stationCnt = 0;
    }
    stationCnt++;
    currentBorough = station.borough;
  }
  /** Attributes **/
  const font = 'Helvetica';

  return (
    <div style={{ width: 1000, height: 400 }}>
      <svg ref={ref} viewBox={`0 0 ${contentWidth} ${contentHeight}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="100%" fill='white' stroke="gray" strokeWidth={5} />
        <g transform={`translate(${112}, ${60})`}>
          <Bullet x={0} y={0} color={color} text={bulletText} textColor={bulletTextColor} font={font} />
          <text x={60} y={20} fontSize={60} fontWeight='bold' fontFamily={font}>
            {name}
          </text>
        </g>
        <line x1={0} x2={contentWidth} y1={112} y2={112} stroke="black" strokeWidth={2} />

        <g transform={`translate(${contentWidth / 12}, ${contentHeight / 2})`}>
          {boroughs.slice(0, -1).map((borough) => (
            <line key={borough.id} x1={borough.pos * spaceBetween - spaceBetween / 2} x2={borough.pos * spaceBetween - spaceBetween / 2} y1={-contentHeight / 5} y2={contentHeight / 2} stroke="rgba(0, 0, 0, 0.25)" strokeWidth={3} />
          ))}

          <Line length={lineLength} color={color} stations={stationsDict} bulletTextColor={bulletTextColor} spaceBetween={spaceBetween} strokeWidth={5} />
          {boroughs.slice(0, -1).map((borough) => (
            <g key={borough.id} >
              <text x={(borough.pos * spaceBetween - spaceBetween / 2) - spaceBetween * 2} y={contentHeight / 2.25} fontSize={24} fontFamily={font} fill="black">{borough.current}</text>
              <text x={(borough.pos * spaceBetween - spaceBetween / 2) + spaceBetween / 6} y={contentHeight / 2.25} fontSize={24} fontFamily={font} fill="black">{borough.next}</text>
            </g>
          ))}
        </g>
      </svg >
    </div>
  );
};

