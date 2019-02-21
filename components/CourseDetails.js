import React, { Component } from 'react';
import {    
    Redirect
  } from "react-router-dom";
import LessonStyles from '../styles/lessonStyles.css';
import validationStyles from '../styles/validationStyles.css';
import { of } from 'rxjs';
import {
   catchError  
} from 'rxjs/operators';
import Course from '../models/Course';

class CourseDetails extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            id: ' ',
            courseNo: ' ',
            courseName: ' ',
            courseDesc: ' ',
            validation1Msg: '',
            validation2Msg: '',
            buttonText: 'Add',
            doRedirect: false                 
        };
    }

    componentWillMount() {
        if (!(this.props.match.params.id === '0')) {
            var serviceURL = 'http://localhost:8080/api/course/ById/'
             +  this.props.match.params.id;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeCourseDetailSetState(res);
                });                      
        }    
    }
    
    initializeCourseDetailSetState(courseDetail) {      
        this.setState({
            id: courseDetail.id,
            courseNo: courseDetail.courseNo,
            courseName: courseDetail.courseName,
            courseDesc: courseDetail.courseDesc,            
            buttonText: 'Update'        
          });             
    }  

    handleFormChange(e) {
        const tID =  e.target.id;
        const value = e.target.value;
        const target = e.target;
        var valMsg = target.validationMessage;

        if (tID === "courseNo") {
            this.setState({courseNo: value});  
            if (valMsg.includes("format")) {
                valMsg = valMsg + " should be like '9999' ";
            }
            this.setState({
                validation1Msg: valMsg 
            });    
        }    
        if (tID === "courseName") {
           this.setState({courseName: value});  
           this.setState({
            validation2Msg: target.validationMessage 
           }); 
        }
        if (tID === "courseDesc") {
           this.setState({courseDesc: value});     
        }                
    }
  
    modifyCourse(e) {
        if (!(this.props.match.params.id === '0')) {
            this.updateCourse(e)
        }
        else {
            e.preventDefault();
            var course = Course; 
            course.id = this.state.id;
            course.courseNo = this.state.courseNo;
            course.courseName = this.state.courseName;
            course.courseDesc = this.state.courseDesc;     
            
            const jBody = JSON.stringify(course);
            
            fetch(            
                `http://localhost:8080/api/course/add/`,
                {
                method: 'POST',  
                body: jBody,  
                headers:{
                'Content-Type': 'application/json' 
                }
            })
            .then(res => res.json())              
            .then(response => of({ apiStatus: JSON.stringify(response)})); //                     
                                  
            this.modifyForm.reset();
            this.forceUpdate(); 
        }
        
        this.setState( {doRedirect: true });
        
    }

    updateCourse(e) {   
        var course = Course; 
        course.id = this.state.id;
        course.courseNo = this.state.courseNo;
        course.courseName = this.state.courseName;
        course.courseDesc = this.state.courseDesc;  

        const jBody = JSON.stringify(course);
                
        fetch(            
                `http://localhost:8080/api/course/update/`,
                {
                method: 'POST',  
                body: jBody,  
                headers:{
                'Content-Type': 'application/json' 
                }
        })
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); //                     
                              
        this.modifyForm.reset();    
              
    }

    render() {
        if (this.state.doRedirect === true) {
            this.setState( {doRedirect: false });
            return (<Redirect to="/" />);
        }

        return (
          <div className="bgLesson">                   
            <div
                style={{
                flex: 1,
                marginLeft: 30,
                width: 600,
                display: 'inline-block',
                color: 'white'                 
                }}
                > 
                    <h4>Course Details</h4>  
                    <form  ref={(input) => {this.modifyForm = input}} className="form"
                     onSubmit={(e)  => {this.modifyCourse(e)}}>
                        <div className="form-group">
                        <div className="col-8">
                            <br/>
                            <label className="label" htmlFor="newItemInput">No:</label>
                            <input required pattern="[0-9]{4}" maxLength="4"
                            type="text" placeholder="Course No."  className="form-control" id="courseNo"
                            value={this.state.courseNo.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation1Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Name:</label>
                            <input required maxLength="25"
                            type="text" placeholder="Course name"  className="form-control" id="courseName"
                            value={this.state.courseName.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation2Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Description:</label>
                            <input   
                            type="text" placeholder="Note" className="form-control" id="courseDesc" 
                            style={{width: 500}}
                            value={this.state.courseDesc.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                        </div>
                        </div>
                        <br/>
                        <button type="submit" className="btn btn-pri"
                         style={{background: "lightgray"}}
                        >{this.state.buttonText}</button>
                        <br/><br/>
                    </form> 
                </div>     
          </div>
        );            
    }
}

export default CourseDetails;