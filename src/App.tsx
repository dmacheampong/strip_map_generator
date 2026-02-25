

import { useRef, useState, type FormEvent } from 'react';
import { useCSVReader } from 'react-papaparse';
import logo from '/logo.svg';
import './App.css';
import { StripMap } from './components/StripMap';

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { CSVReader } = useCSVReader();

  const [name, setName] = useState("");
  const [bullet, setBullet] = useState("");
  const [bulletTextColor, setBulletTextColor] = useState("#FFFFFF");
  const [color, setColor] = useState("#000000");
  const [stationsCSV, setStationsCSV] = useState();
  const [stationsDict, setStationsDict] = useState<Array<any>>([]);
  const [generated, setGenerated] = useState(false);

  function parseStationsCSV(stationsCSV: any) {
    const cols = stationsCSV[0] as Array<string>;
    const stations = [];
    for (let i = 1; i < stationsCSV.length; i++) {
      const station = {
        id: i,
        name: stationsCSV[i][cols.indexOf('station')],
        borough: stationsCSV[i][cols.indexOf('borough')],
        transfers: stationsCSV[i][cols.indexOf('transfers')] ? stationsCSV[i][cols.indexOf('transfers')].split("/") : [],
        isAccessible: stationsCSV[i][cols.indexOf('is_accessible')] === 'yes'
      };

      stations.push(station);
    }
    setStationsDict(stations);
  }

  function downloadMap() {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.src = svgURL;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context?.drawImage(image, 0, 0);
        //const imgURL = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

        const a = document.createElement("a");
        a.target = "_blank";
        a.href = svgURL;
        a.download = "strip-map.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

    }
  }

  function handleGenerate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    parseStationsCSV(stationsCSV);
    setGenerated(true);
  }

  return (
    <>
      <div>
        <img src={logo} className="logo" alt="Logo" />
      </div>
      <h1>NYC Subway Strip Map Generator </h1>

      <div>
        <form onSubmit={handleGenerate}>
          <label>Line Name: { }
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <br />
          <br />
          <label>Line Bullet: { }
            <input type="text" value={bullet} size={3} maxLength={3} onChange={e => setBullet(e.target.value)} />
          </label>
          <br />
          <br />
          <label>Bullet Text Color: { }
            <select value={bulletTextColor} onChange={e => setBulletTextColor(e.target.value)}>
              <option value={'#FFFFFF'}>White</option>
              <option value={'#000000'}>Black</option>
            </select>
          </label>
          <br />
          <br />
          <label>Line Color: { }
            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </label>
          <br />
          <br />
          <label>
            <CSVReader onUploadAccepted={(results: any) => {
              setStationsCSV(results.data);
            }}>
              {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, }: any) => (
                <>
                  <div>
                    <button type="button" {...getRootProps()}>
                      Upload Stations CSV
                    </button>
                    <pre style={{
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                      margin: 0,
                    }}>
                      Example format:<br />
                      | borough  | station   | transfers | is_accessible |<br />
                      +----------+-----------+-----------+---------------+<br />
                      | Queens   | First St  | 1/2/3     | yes           |<br />
                      +----------+-----------+-----------+---------------+<br />
                      | Queens   | Second St |           | no            |<br />
                      +----------+-----------+-----------+---------------+<br />
                      | Brooklyn | Third St  | A/C/E     | yes           |<br />
                      +----------+-----------+-----------+---------------+<br />
                    </pre>
                    <div>
                      {acceptedFile && "File: " + acceptedFile.name}
                    </div>
                    <button type="button" {...getRemoveFileProps()}>
                      Remove
                    </button>
                  </div>
                  <ProgressBar />
                </>
              )}
            </CSVReader>
          </label>
          <br />
          <button type="submit">
            Generate
          </button>
        </form>
        <br />
        {generated && <div>
          <div>
            <StripMap ref={svgRef} name={name} bulletText={bullet} bulletTextColor={bulletTextColor} color={color} stationsDict={stationsDict} />
            <div>
            </div>
          </div>
          <div>
            <button onClick={downloadMap}>
              Download Strip Map
            </button>
          </div>
        </div>
        }
      </div>
    </>
  )
}

export default App
