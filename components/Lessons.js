import React, { Component } from "react";
import {
  Link,
  Redirect
} from "react-router-dom";
import Styles from './LearnerStyles';
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
let lessonsStream = new Subject();
let getDataStream = new Subject();

class Lessons extends Component {

    constructor(props) {
        super(props);
        this.state = {
            doRedirect: false,
            data: {
                lessons: { dataArray: [] }               
            }      
        };   
    }
   
    componentWillMount() {
        if (!(this.props.match.params.courseNo === '0')) {
            var serviceURL = 'http://localhost:8080/api/lesson/ByCourse/'
            +  this.props.match.params.courseNo;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeLessonListSetState(res);
            });                      
        }    
    }
   
    initializeLessonListSetState(lessonList) {    
        this.setState({
            data: {
                lessons: {
                    dataArray: lessonList
                }
            }    
        });
    }

    
    deleteItem(item) {
       
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
    if (this.state.doRedirect === true) {
      this.setState( {doRedirect: false });
      return (<Redirect to="/" />);
    }

    return (
      <div>      
        <h2>Lessons</h2>               
        <div
            style={{
              flex: 1,
              marginLeft: 30,
              width: 600,
              display: 'inline-block',
              background: 'lightgray'
            }}
         > 
             <table className="table">              
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
                    this.state.data.lessons.dataArray.map(item  => {
                        return (
                        <tr key={item.id}>
                            <td>{item.lessonNo}</td>
                            <td>{item.courseNo}</td>
                            <td>{item.lessonName}</td>
                            <td className="text-right">
                               <Link to={"/lessons/detail/" + item.id }>Modify</Link>                               
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
            <br/>          
            <Link to="/lessons/detail/0">Add</Link>            
        </div>                    
      </div>
    );
  }

}
 
export default Lessons;