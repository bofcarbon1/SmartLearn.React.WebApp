import React, { Component } from 'react';
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
let learnerStream = new Subject();
let getDataStream = new Subject();

class Learners extends Component {
    
  constructor(props) {
    super(props);
    this.state = {
      prefStatus: [{ learners: true }],
      searchText: '',
      doRedirect: false,
      data: {
        learners: { dataArray: [] }               
      }            
    };   
  }
   
  componentDidMount() {
    this.initializeSearchStream();
    this.initializeLearnerList();
    this.initializeInputStream();
    this.initializeDataStreams();
  };

  initializeLearnerList() {
    var serviceURL = 'http://localhost:8080/api/learner/learners';  
        
    fetch(
       serviceURL                                  
       )              
     .then(res => res.json())              
     .then(res => {this.initializeLearnerListSetState(res)} );
    
     this.forceUpdate();     
  }

  initializeLearnerListSetState(learnerList) {    
    this.setState({
      data: {
        learners: {
          dataArray: learnerList
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
            case 'learners':
              learnerStream.next({ searchText: item.text });
              break; 
            default:  
              learnerStream.next({ searchText: item.text });          
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
    learnerStream
      .pipe(map(val => val.searchText), distinctUntilChanged())
      .subscribe(val => {
        getDataStream.next({ searchText: val, pref: 'learners' });
      });
    getDataStream
      .pipe(
        flatMap(val => {
          let outVal = val;
          var serviceURL = 'http://localhost:8080/api/learner/learners';          
          if (!(val.searchText === ' ')) {
            serviceURL = `http://localhost:8080/api/learner/ByFilter/${val.searchText}`
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
        "http://localhost:8080/api/learner/" + item.id, 
        requestOptions
        )
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); 
    
    this.setState({
      searchText: ' ',   
       doRedirect: true 
    });      
               
  }

  render() {
    if (this.state.doRedirect === true) {
      this.setState( {doRedirect: false });
      return (<Redirect to="/" />);
    }

    return (
      <div  style={{
        background: '#2a4670'
      }}>       
        <div style={{ 
            flexDirection: 'row',
            color: "white",
            marginLeft: 30 }}>           
            <h4>Learners</h4> 
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
              width: 800,
              display: 'inline-block',
              background: 'white'              
            }}
         > 
             <table className="table table-striped table-bordered table-hover">              
              <thead>
                  <tr>
                      <th>Name</th>
                      <th>Acct No.</th>
                      <th>Note</th>
                      <th>Actions</th>
                  </tr>    
              </thead>
              <tbody>
                {
                    this.state.data.learners.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.learnerName}</td>
                            <td>{item.learnerNo}</td>
                            <td>{item.learnerNote}</td>
                            <td className="text-right">
                               <Link to={"/learners/detail/" + item.id }>Modify</Link>                               
                            </td>
                            <td className="text-right">
                                <button 
                                onClick={(e) => this.deleteItem(item)} 
                                type="button" className="btn btn-default btn-sm">Remove
                                </button>
                            </td>
                         </tr>                           
                        ) 
                    })
                }
              </tbody>              
            </table>                   
            <Link to={"/learners/detail/0"}>Add</Link>            
        </div>
        <br/>
        <br/>              
      </div>         
    );
  }
}

export default Learners;