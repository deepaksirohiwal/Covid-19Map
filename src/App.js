import React,{useState,useEffect} from 'react';
import { FormControl, MenuItem,Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table';
import LineGraph from './LineGraph'
import './App.css';
import { sortData, prettyPrintStat } from './util';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country,setCountry]= useState('Worldwide');
  const [countryInfo,setCountryInfo]=useState({});
  const [tableData,setTableData]=useState([]);
  const [mapCenter,setMapCenter]=useState({lat:34.80746,lng:-40.4796})
  const [mapZoom,setMapZoom]=useState(3);
  const [mapCountries,setMapCountries]=useState([])
  const [casesType,setCasesType]=useState("cases")

  useEffect(()=>{
    
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=>response.json())
    .then(data=>{
      setCountryInfo(data)
    })
   
  },[])

  
  useEffect(()=>{
    const getCountriesData=async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>
        response.json()
      )
      .then((data)=>{
        const countries=data.map((country)=>({
          name:country.country,
          value:country.countryInfo.iso2
        }));

        const sortedData=sortData(data)
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data)
      })
    }
    getCountriesData();
  },[]);

  const onCountryChange=async(e)=>{
    const countryCode=e.target.value;      
   
    if(countryCode==="Worldwide"){
      const url="https://disease.sh/v3/covid-19/all";
      fetch(url)
      .then((response)=>response.json())
      .then(data=>{
      setCountryInfo(data)
      setMapCenter({lat:34.80746,lng:-40.4796})
      setCountry('Worldwide')
      setMapZoom(3)
      })
      
    }else{
      const url=`https://disease.sh/v3/covid-19/countries/${countryCode}` 
     
      await fetch(url)
      .then(response=>response.json())
      .then(data =>{
      setCountry(countryCode)
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      setMapZoom(4)
      })

    }
    
    
  }
  

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header"> 
            <h1>Covid-19 Tracker</h1>
            <FormControl className="app__dropdown">
              <Select variant="outlined" onChange={onCountryChange} value={country}>
                <MenuItem value="Worldwide">Worldwide</MenuItem>
                {countries.map((country)=>(
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </div>  
        <div className="app__stats">
          <InfoBox 
          isRed
          active={casesType==="cases"}
          onClick={(e)=>setCasesType("cases")}
          cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} title="Coronavirus Cases"/>
          <InfoBox 
          active={casesType==="recovered"}
          onClick={(e)=>setCasesType("recovered")}
          cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} title="Recovered"/>
          <InfoBox 
          isRed
          active={casesType==="deaths"}
          onClick={(e)=>setCasesType("deaths")}
          cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} title="Deaths"/>
        </div>
        <Map
          
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          
        />
      </div>      
      <Card className="app__right">
        <CardContent>
          <h1>Live cases</h1>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>              
    </div>
  );
}

export default App;
