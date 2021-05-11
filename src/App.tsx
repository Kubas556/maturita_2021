import React, { useEffect, useCallback, useRef } from 'react';
import nahoru from './nahoru.svg'
import dolu from './dolu.svg'
import doprava from './vpravo.svg'
import doleva from './vlevo.svg'
import './App.css';
const { useState } = React;

function App() {

  const [tiles,setTiles] = useState<any>([]);
  const [robotConfig,setRobotConfig] = useState({x:0,y:9,background:doprava,facing:0,drawColor:"#ffa500"});
  const [tilesColor, setTilesColor] = useState<any>([]);
  const [commandsLog, setCommandsLog] = useState<any>([]);
  const [commandsToRun,setCommandsToRun] = useState<any>([]);
  
  const [commandsTextarea,setCommandsTextarea] = useState<string>();
  const textArea = useRef<any>();
  const colorPicker = useRef<any>();

  const commonTileCSS = {
    width: "5vmin",
    height: "5vmin",
    border: "1px solid white"
  }

  useEffect(() => {
    setTiles([]);
    if(tilesColor.length > 0) {
      let id = 0;
      for(let y = 0; y < 10; y++) {
        let xColors = [];
        for(let x = 0; x < 10; x++) {
          setTiles((tiles:any) => {id++; return [...tiles,<div key={id} style={{...commonTileCSS,gridColumn:x+1,gridRow:y+1,background:tilesColor[y][x].color}}/>]});
        }
      }
    }
  },[tilesColor]);

useEffect(() => {
  colorPicker.current.value = robotConfig.drawColor;
},[robotConfig]);

  useEffect(() => {
    let newColors:any = [];
    for(let y = 0; y < 10; y++) {
      let xColors = [];
      for(let x = 0; x < 10; x++) {
        xColors.push({color:"none"});
      }
      newColors.push(xColors);
    }
    setTilesColor(newColors);
  },[]);

  let runCommand = useCallback((command:string) => {
    let parsedCommand = command.split(' ');
      switch (parsedCommand[0]) {
        case "krok":
          switch (robotConfig.facing) {
            case 0:
              if(robotConfig.x < 9) {
                setRobotConfig(config => {return {...config,x: config.x+1}});
                setCommandsLog((log:any) =>{return [{name:command, value:"doprava"},...log]});
              }
              break;
            case 180:
              if(robotConfig.x > 0) {
                setRobotConfig(config => {return {...config,x: config.x-1}});
                setCommandsLog((log:any) =>{return [{name:command, value:"doleva"},...log]});
              }
              break;
            case 90:
              if(robotConfig.y > 0) {
                setRobotConfig(config => {return {...config,y: config.y-1}});
                setCommandsLog((log:any) =>{return [{name:command, value:"nahoru"},...log]});
              }
              break;
            case 270:
              if(robotConfig.y < 9) {
                setRobotConfig(config => {return {...config,y: config.y+1}});
                setCommandsLog((log:any) =>{return [{name:command, value:"dolu"},...log]});
              }
            break;
          }
        break;
        case "otoc":
          let angle = 0;
          setRobotConfig(config => {
            angle = config.facing === 270 ? 0 : config.facing + 90;
            return {
              ...config,
              facing: angle,
              background: angle === 0 ? doprava :
                          angle === 90 ? nahoru :
                          angle === 180 ? doleva :
                          angle === 270? dolu : ""
            }
          });
          setCommandsLog((log:any) =>{return [{name:command, value:angle},...log]});
        break;
        case "vypln":
          if(parsedCommand.length > 1) {
            setRobotConfig(config => {return {...config,drawColor: parsedCommand[1]}});
          }

          setTilesColor((tiles:any) => {
            let newArr = [...tiles];
            newArr[robotConfig.y][robotConfig.x].color = parsedCommand.length > 1 ? parsedCommand[1] : robotConfig.drawColor;
            return newArr;
          });
          setCommandsLog((log:any) =>{return [{name:command, value:robotConfig.drawColor},...log]});
        break;
        case "vymaz":
          setTilesColor((tiles:any) => {
            let newArr = [...tiles];
            newArr[robotConfig.y][robotConfig.x].color = "none";
            return newArr;
          });
          setCommandsLog((log:any) =>{return [{name:command, value:"none"},...log]});
        break;
        case "reset":
          let newColors:any = [];
          for(let y = 0; y < 10; y++) {
            let xColors = [];
            for(let x = 0; x < 10; x++) {
              xColors.push({color:"none"});
            }
            newColors.push(xColors);
          }
          setTilesColor(newColors);
          setRobotConfig({x:0,y:9,background:doprava,facing:0,drawColor:"#ffa500"});
          setCommandsLog([]);
        break;
      }
  },[robotConfig]);

  useEffect(() => {
    if(commandsToRun.length === 0)
    return;

    const id = setTimeout(() => {
      let copy = [...commandsToRun];
      //@ts-ignore
      runCommand(copy.pop());
      setCommandsToRun(copy);
    },100);

    return () => clearTimeout(id);
  },[commandsToRun]);

  let runCommands = useCallback(() => {
      let commands:any = commandsTextarea?.trim()?.split("\n");
      commands = commands?.map((command:any) => command.toLowerCase());
      let parsedCommands:any = [];
      commands.forEach((command:any) => {
          let commandRepeats = command.split(' ');
          if(commandRepeats.length > 1) {
            if(commandRepeats[0] !== "vypln") {
              for(let i = 0; i < commandRepeats[1];i++) {
                parsedCommands.push(commandRepeats[0]);
              }
            } else {
              parsedCommands.push(command);
            }
          } else {
            parsedCommands.push(commandRepeats[0]);
          }
      });
      setCommandsToRun(parsedCommands.reverse());
  },[commandsTextarea])

  function download() {
    var a = document.createElement("a");
    //@ts-ignore
    var file = new Blob([commandsTextarea], {type: "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "saved_data";
    a.click();
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {
          //@ts-ignore
          window.process?.versions["electron"] && <button onClick={()=>{
            const { ipcRenderer } = window.require('electron');
            //@ts-ignore
            ipcRenderer.invoke('perform-action');
          }}>exit</button>
        }
      <div style={{display:"grid"}}>
        {
          tiles.map((tile:any) => {
            return tile;
          })
        }
        <img src={robotConfig.background} style={{gridColumn:robotConfig.x+1,gridRow:robotConfig.y+1,...commonTileCSS}}></img>
      </div>
      <div style={{display:"flex",flexDirection:"row"}}>
        <button onClick={()=>runCommand("krok")}>Krok</button>
        <button onClick={()=>runCommand("otoc")}>Otoč</button>
        <button onClick={()=>runCommand("vypln")}>Vyplň</button>
        <button onClick={()=>runCommand("vymaz")}>Vymaž</button>
        <button onClick={()=>runCommand("reset")}>Reset</button>
      </div>
      <div style={{display:"grid"}}>
        <button onClick={runCommands}>Spusť</button>
        <textarea ref={textArea} onChange={(e:any) => {setCommandsTextarea(e.target.value)}}/>
        <div>
          <button onClick={download}>Uložit</button>
          <input onChange={(e) => {
            //@ts-ignore
            e.target.files[0].text().then(data => textArea.current.value = data);
            }} type="file" accept=".txt"/>
        </div>
      </div>
      <div style={{
        display:"flex",
        width:"calc(10vmin+10px)",
        height:"30rem",
        position:"absolute",
        left:0,
        flexDirection:"column",
        overflowY:"scroll",
        fontSize:"calc(1vmin+5px)"
        }}>
          {
            commandsLog.map((command:any,index:number) => {
              return <div key={index}>{command.name}|{command.value}</div>
            })
          }
      </div>
      <div style={{
        display:"flex",
        width:"calc(10vmin+10px)",
        position:"absolute",
        right:0,
        fontSize:"calc(1vmin+5px)"
        }}>
          <input ref={colorPicker} type="color" defaultValue={"#ffa500"} onChange={(e)=>setRobotConfig(config => {return {...config,drawColor: e.target.value}})}/>
      </div>
      </header>
    </div>
  );
}

export default App;
