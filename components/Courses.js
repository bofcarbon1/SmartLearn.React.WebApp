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
//import Lessons from './Lessons';

let makeCallStream = new Subject();
let inputStream = new Subject();
let courseStream = new Subject();
let getDataStream = new Subject();

class Courses extends Component {

  constructor(props) {
    super(props);
    this.state = {
      prefStatus: [{ courses: true }],
      searchText: '',
      doRedirect: false,
      isAPIDone: false,
      lessonHeader: ' ',
      lessonCourseNo: ' ',
      data: {
        courses: { dataArray: [] }                          
      }, 
      lessondata: {
        lessons: { dataArray: [] }                  
      }      
    };   
  }
   
  componentDidMount() {
    this.initializeSearchStream();
    this.initializeCourseList();
    this.initializeInputStream();
    this.initializeDataStreams();
    this.loadLessons('1001', 'mongoDB');
  };

  initializeCourseList() {
    var serviceURL = 'http://localhost:8080/api/course/courses';  
        
    fetch(
       serviceURL                                  
       )              
     .then(res => res.json())              
     .then(res => {this.initializeCourseListSetState(res)} );
    
     this.forceUpdate();     
  }

  initializeCourseListSetState(courseList) {    
    this.setState({
      isAPIDone: true
    });
    this.setState({
      data: {
        courses: {
          dataArray: courseList
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
            case 'courses':
              courseStream.next({ searchText: item.text });
              break; 
            default:  
              courseStream.next({ searchText: item.text });          
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
    courseStream
      .pipe(map(val => val.searchText), distinctUntilChanged())
      .subscribe(val => {
        getDataStream.next({ searchText: val, pref: 'courses' });
      });
    getDataStream
      .pipe(
        flatMap(val => {
          let outVal = val;
          var serviceURL = 'http://localhost:8080/api/course/courses';          
          if (!(val.searchText === ' ')) {
            serviceURL = `http://localhost:8080/api/course/ByFilter/${val.searchText}`
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
        "http://localhost:8080/api/course/" + item.id, 
        requestOptions
        )
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); 
    
    this.setState({
      searchText: ' ',   
      doRedirect: true 
    });    
               
  }

  loadLessons(courseNo, lessonHeader) {
    this.setState({
      isAPIDone: false 
    });
    this.setState({
      lessonCourseNo: courseNo 
    });

    if (!(courseNo === '0')) {
      var serviceURL = 'http://localhost:8080/api/lesson/ByCourse/'
      + courseNo.trim();            
      fetch (serviceURL)
          .then(res => res.json())              
          .then(res => {
              this.initializeLessonListSetState(res);
      });                      
    }    
    this.initializeLessonListHeaderSetState(lessonHeader);
  }  
  
  initializeLessonListSetState(lessonList) {    
    this.setState({
        lessondata: {
            lessons: {
                dataArray: lessonList
            }
        }    
    });
    this.setState({
      isAPIDone: true 
    });
  }

  initializeLessonListHeaderSetState(lessonHeader) {    
    this.setState({
        lessonHeader: lessonHeader + " Lessons"          
    });
  }

  deleteLesson(item) {
       
    const requestOptions = {
        method: 'DELETE'
    };

    fetch(
        "http://localhost:8080/api/lesson/" + item.id, 
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
      return (<Redirect to="/courses" />);
    }

    
    return (
      <div className="row"  style={{
        background: '#2a4670'
      }}>
      <div className="col-md-6"> 
      <div>      
        <h4 style={{
        color: 'white'
      }}>Courses</h4> 
        <div style={{ 
            flexDirection: 'row',
            marginLeft: 30,
            width: 600,
            background: 'white'             
            }}>           
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
        <br/>
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
                    this.state.data.courses.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.courseNo}</td>
                            <td>{item.courseName}</td>
                            <td className="text-right">
                               <Link to={"/courses/detail/" + item.id }>Modify</Link>                               
                            </td>
                            <td className="text-right">                                 
                               <button 
                                onClick={(e) => this.loadLessons(item.courseNo, item.courseName)} 
                                type="button" className="btn btn-default btn-sm">Lessons
                                </button>                             
                            </td>
                            <td className="text-right">
                                <button 
                                onClick={(e) => this.deleteLesson(item)} 
                                type="button" className="btn btn-default btn-sm">Remove
                                </button>
                            </td>
                         </tr>                           
                        ) 
                    })
                }
              </tbody>              
            </table>                      
            <Link to="/courses/detail/0">Add</Link>            
        </div>
        <br/>   
        <br/>                      
      </div>
      </div>
      <div className="col-md-6">
        <h4 style={{
        color: 'white'
      }}>{this.state.lessonHeader}</h4>                       
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
                    <th>No</th>
                    <th>Course No</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>    
              </thead>
              <tbody>
                {
                    this.state.lessondata.lessons.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.lessonNo}</td>
                            <td>{item.courseNo}</td>
                            <td>{item.lessonName}</td>
                            <td className="text-right">
                               <Link to={"/lessons/detail/" 
                               + item.id + "/" + this.state.lessonCourseNo }>Modify</Link>                               
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
            <Link to={"/lessons/detail/0/" + this.state.lessonCourseNo}>Add</Link>            
        </div> 
        <br/>   
        <br/>   
      </div>    
      </div>  
    );
  }

}
 
export default Courses;