import React, { Component } from "react";
import {
  Link,
  Redirect
} from "react-router-dom";
import Styles from './LearnerStyles';
import '../components/bootstrap.css';
import { Subject, empty, of } from 'rxjs';
import {
  flatMap,
  map,
  distinctUntilChanged,
  filter,
  catchError 
} from 'rxjs/operators';

let makeCallStream = new Subject();
let inputStream = new Subject();
let projectStream = new Subject();
let getDataStream = new Subject();

class Projects extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      prefStatus: [{ courses: true }],
      searchText: '',
      doRedirect: false,
      isAPIDone: false,
      taskHeader: ' ',
      taskProjectNo: ' ',
      projectdata: {
        projects: { dataArray: [] }                          
      }, 
      taskdata: {
        tasks: { dataArray: [] }                  
      }      
    };   
  }
  
  componentDidMount() {
    this.initializeSearchStream();
    this.initializeProjectList();
    this.initializeInputStream();
    this.initializeDataStreams();
    this.loadTasks('10011', 'SmartLearn');
  };

  initializeProjectList() {
    var serviceURL = 'http://localhost:8080/api/project/projects';  
        
    fetch(
       serviceURL                                  
       )              
     .then(res => res.json())              
     .then(res => {this.initializeProjectListSetState(res)} );
    
     this.forceUpdate();     
  }

  initializeProjectListSetState(projectList) {    
    this.setState({
      isAPIDone: true
    });
    this.setState({
      projectdata: {
        projects: {
          dataArray: projectList
        }
      }    
    });
  }

  initializeSearchStream() {
    makeCallStream
      .pipe(
        filter(val => this.state.searchText !== ''),
        map(val => {
          return val.value;
        }),
        flatMap(val => {
          let arr = [];
          this.state.prefStatus.map((item, index) => {
            if (item[Object.keys(item)[0]]) {
              arr.push({ pref: item, text: val });
            }
          });
          return of(arr);
        })
      )
      .subscribe(val => {
        val.map((item, index) => {
          switch (Object.keys(item.pref)[0]) {
            case 'projects':
              projectStream.next({ searchText: item.text });
              break; 
            default:  
              projectStream.next({ searchText: item.text });          
          }
        });
      });
  }

  initializeInputStream() {
    inputStream.subscribe(val => {
      this.setState({
        searchText: val.value
      });
    });
  }

  initializeDataStreams() {
    projectStream
      .pipe(map(val => val.searchText), distinctUntilChanged())
      .subscribe(val => {
        getDataStream.next({ searchText: val, pref: 'projects' });
      });
    getDataStream
      .pipe(
        flatMap(val => {
          let outVal = val;
          var serviceURL = 'http://localhost:8080/api/project/projects';          
          if (!(val.searchText === ' ')) {
            serviceURL = `http://localhost:8080/api/project/ByFilter/${val.searchText}`
          };         
          return fetch(
              serviceURL                                  
          )
            .then(val => val.json())              
            .then(val => of({ pref: outVal.pref, res: val })); // Pasing data downstream for later use
            }),    
        catchError(err => {
          return empty();
        })
      )      
      .subscribe(val => {             
        this.setState({
          data: {
            ...this.state.data,
            [val.value.pref]: {
              dataArray: val.value.res
            }
          }        
        });
      });
  }

  deleteItem(item) {
       
    const requestOptions = {
        method: 'DELETE'
      };

    fetch(
        "http://localhost:8080/api/project/" + item.id, 
        requestOptions
        )
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); 
    
    this.setState({
      searchText: ' ',   
      doRedirect: true 
    });    
               
  }

  loadTasks(projectNo, taskHeader) {
    this.setState({
      isAPIDone: false 
    });
    this.setState({
      taskProjectNo: projectNo 
    });

    if (!(projectNo === '0')) {
      var serviceURL = 'http://localhost:8080/api/task/ByProject/'
      + projectNo.trim();            
      fetch (serviceURL)
          .then(res => res.json())              
          .then(res => {
              this.initializeTaskListSetState(res);
      });                      
    }    
    this.initializeTaskListHeaderSetState(taskHeader);
  }  

  initializeTaskListSetState(taskList) {    
    this.setState({
        taskdata: {
            tasks: {
                dataArray: taskList
            }
        }    
    });
    this.setState({
      isAPIDone: true 
    });
  }
  
  initializeTaskListHeaderSetState(taskHeader) {    
    this.setState({
        taskHeader: taskHeader + " Tasks"          
    });
  }

  deleteTask(item) {
       
    const requestOptions = {
        method: 'DELETE'
    };

    fetch(
        "http://localhost:8080/api/task/" + item.id, 
        requestOptions
        )
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); 

    this.setState({        
        doRedirect: true 
    });
           
  }

  render() {
    
    if (this.state.isAPIDone === false) {
      return null;
    }
    if (this.state.doRedirect === true) {
      this.setState( {doRedirect: false });
      return (<Redirect to="/projects" />);
    }
    
    return (
      <div className="row" style={{
        background: '#2a4670'
      }}>
      <div className="col-md-6"> 
      <div>      
        <h4  style={{
        color: 'white'
      }}>Projects</h4> 
        <div style={{ 
            flexDirection: 'row',
            marginLeft: 30 }}>           
            <input
              style={Styles.inputBox}
              placeholder={'Search...'}
              onChange={e => inputStream.next({ value: e.target.value })}
            />
            <button
              style={Styles.searchBut}
              onClick={e =>
                makeCallStream.next({ value: this.state.searchText })
              }
            >
              Search
            </button>
        </div>
        <div
            style={{
              flex: 1,
              marginLeft: 30,
              width: 600,
              display: 'inline-block',
              background: 'white'
            }}
         > 
             <table className="table table-striped table-bordered table-hover">              
              <thead>
                  <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Actions</th>
                  </tr>    
              </thead>
              <tbody>
                {
                    this.state.projectdata.projects.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.projectNo}</td>
                            <td>{item.projectName}</td>
                            <td className="text-right">
                               <Link to={"/projects/detail/" + item.id }>Modify</Link>                               
                            </td>
                            <td className="text-right">                                 
                               <button 
                                onClick={(e) => this.loadTasks(item.projectNo, item.projectName)} 
                                type="button" className="btn btn-default btn-sm">Tasks
                                </button>                             
                            </td>
                            <td className="text-right">
                                <button 
                                onClick={(e) => this.deleteProject(item)} 
                                type="button" className="btn btn-default btn-sm">Remove
                                </button>
                            </td>
                         </tr>                           
                        ) 
                    })
                }
              </tbody>              
            </table>                
            <Link to="/projects/detail/0">Add</Link>            
        </div>                      
      </div>  
             
      </div> 

      <div className="col-md-6">
        <h4  style={{
        color: 'white'
      }}>{this.state.taskHeader}</h4>                       
        <div
            style={{
              flex: 1,
              marginLeft: 30,
              width: 600,
              display: 'inline-block',
              background: 'white'
            }}
         > 
             <table className="table table-striped table-bordered table-hover ">              
              <thead>
                  <tr>
                    <th>Task No</th>
                    <th>Project No</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>    
              </thead>
              <tbody>
                {
                    this.state.taskdata.tasks.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.taskNo}</td>
                            <td>{item.projectNo}</td>
                            <td>{item.taskName}</td>
                            <td className="text-right">
                               <Link to={"/tasks/detail/" 
                               + item.id + "/" + this.state.taskProjectNo }>Modify</Link>                               
                            </td>
                            <td className="text-right">
                                <button 
                                onClick={(e) => this.deleteTask(item)} 
                                type="button" className="btn btn-default btn-sm">Remove
                                </button>
                            </td>
                         </tr>                           
                        ) 
                    })
                }
              </tbody>              
            </table>                  
            <Link to={"/tasks/detail/0/" + this.state.taskProjectNo}>Add</Link>            
        </div> 
        <br/>
        <br/>
      </div>    
      </div>  
    );
  }

}
 
export default Projects;