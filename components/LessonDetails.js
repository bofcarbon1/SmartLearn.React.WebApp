import React, { Component } from 'react';
import {    
    Redirect
  } from "react-router-dom";
import { of } from 'rxjs';
import {
   catchError  
} from 'rxjs/operators';
import Select from 'react-select';
import LessonStyles from '../styles/lessonStyles.css';
import validationStyles from '../styles/validationStyles.css';
import Lesson from '../models/Lesson';

class LessonDetails extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            id: ' ',
            lessonNo: ' ',
            courseNo: ' ',
            lessonName: ' ',
            lessonDesc: ' ',
            options: [],
            selectedOption: null,
            options2: [],
            selectedOption2: null,
            projectNo: ' ',
            taskNo: ' ',
            validation1Msg: '',
            validation2Msg: '',
            buttonText: 'Add',
            doRedirect: false,
            isAPIDone: true                                  
        };
    }

    componentWillMount() {             
        this.setState( {courseNo: this.props.match.params.courseNo });
        if (!(this.props.match.params.id === '0')) {
            this.setState({
                isAPIDone: false
            }); 
            var serviceURL = 'http://localhost:8080/api/lesson/ById/'
             +  this.props.match.params.id;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeLessonDetailSetState(res);
                });
                
            this.setState({
                isAPIDone: true
            });                       
        }        
                    
    }

    componentDidMount() {
         
    }
    
    initializeLessonDetailSetState(lessonDetail) {      
        this.setState({
            id: lessonDetail.id,
            lessonNo: lessonDetail.lessonNo, 
            courseNo: lessonDetail.courseNo,
            lessonName: lessonDetail.lessonName,
            lessonDesc: lessonDetail.lessonDesc, 
            projectNo: lessonDetail.projectNo,
            taskNo: lessonDetail.taskNo,           
            buttonText: 'Update'        
          }); 
          this.initializeProjectSelectLoad();
          this.initializeTaskSelectLoad(lessonDetail.projectNo);              
    }  

    initializeProjectSelectLoad() {
        this.setState({
            isAPIDone: false
        });
        var serviceURL = 'http://localhost:8080/api/project/projects';  
            
        fetch(
           serviceURL                                  
           )              
         .then(res => res.json())              
         .then(res => {this.initializeProjectSelectsSetState(res)} );
        
        this.setState({
            isAPIDone: true
        });
    }
    
    initializeProjectSelectsSetState(projectList) {    
        var filteredList = projectList.map((item, index) => (
            {value: item.projectNo, label: item.projectName}          
        ));  

        const preSelectProjectNo = this.state.projectNo;
        var preSelectProjectName = ' ';
        projectList.map((item, index) => 
            {if (item.projectNo === preSelectProjectNo)  
                {
                    preSelectProjectName = item.projectName;
                }}
        );  
        const preSelectProject = {value: preSelectProjectNo, label: preSelectProjectName};
        
        this.setState({   
            selectedOption: preSelectProject             
        });   
        this.setState({   
              options: filteredList             
        });
    }

    initializeTaskSelectLoad(lessonDetailProjectNo) {
        const projectNo = lessonDetailProjectNo; // this.state.projectNo;
        this.setState({
            isAPIDone: false
        });
        if (projectNo === " ") {
            var serviceURL = 'http://localhost:8080/api/task/selects';  
        }
        else {
        var serviceURL = 'http://localhost:8080/api/task/ByProject/' + projectNo;  
        } 

        fetch(
           serviceURL                                  
           )              
         .then(res => res.json())              
         .then(res => {this.initializeTaskSelectsSetState(res)} );
        
        this.setState({
            isAPIDone: true
        });
    }
    
    initializeTaskSelectsSetState(taskList) {    
        var filteredList = taskList.map((item, index) => (
            {value: item.taskNo, label: item.taskName}          
        )); 
        
        const preSelectTaskNo = this.state.taskNo;
        var preSelectTaskName = ' ';
        taskList.map((item, index) => {
            if (item.taskNo === preSelectTaskNo)  
                {
                    preSelectTaskName = item.taskName;
                }
            }
        );  
        
        const preSelectTask = {value: preSelectTaskNo, label: preSelectTaskName};
            
        this.setState({   
            selectedOption2: preSelectTask             
        });      
        this.setState({   
            options2: filteredList             
        });   

    }

    handleSelectProjectChange = (selectedOption) => {
        this.setState({ selectedOption });
        this.setState({ projectNo: selectedOption.value });
          
        this.initializeTaskSelectLoad(this.state.projectNo);
        
    }
  
    handleSelectTaskChange = (selectedOption2) => {
        this.setState({ selectedOption2 });
        this.setState({ taskNo: selectedOption2.value });        
    }

    handleFormChange(e) {
        const tID =  e.target.id;
        const value = e.target.value;
        const target = e.target;
        var valMsg = target.validationMessage;

        if (tID === "lessonNo") {
            this.setState({lessonNo: value});  
            this.setState({
                validation1Msg: valMsg 
            });   
        }       
        if (tID === "lessonName") {
           this.setState({lessonName: value}); 
           this.setState({
            validation2Msg: valMsg 
           });   
        }
        if (tID === "lessonDesc") {
           this.setState({lessonDesc: value});     
        }                
    }

    modifyLesson(e) {
        if (!(this.props.match.params.id === '0')) {
            this.updateLesson(e)
        }
        else {
            e.preventDefault();
            var lesson = Lesson; 
            lesson.id = this.state.id;
            lesson.lessonNo = this.state.lessonNo;
            lesson.courseNo =  this.props.match.params.courseNo;
            lesson.lessonName = this.state.lessonName;
            lesson.lessonDesc = this.state.lessonDesc; 
            lesson.projectNo = this.state.projectNo; 
            lesson.taskNo = this.state.taskNo;   
            
            const jBody = JSON.stringify(lesson);

            this.setState({
                isAPIDone: false
            });
            
            fetch(            
                `http://localhost:8080/api/lesson/add/`,
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
            this.setState({
                isAPIDone: true
            });            
        }
        
        this.setState( {doRedirect: true });
        
    }

    updateLesson(e) {   
        var lesson = Lesson; 
        lesson.id = this.state.id;
        lesson.lessonNo = this.state.lessonNo;
        lesson.courseNo = this.props.match.params.courseNo;
        lesson.lessonName = this.state.lessonName;
        lesson.lessonDesc = this.state.lessonDesc;
        lesson.projectNo = this.state.projectNo; 
        lesson.taskNo = this.state.taskNo;  

        const jBody = JSON.stringify(lesson);

        this.setState({
            isAPIDone: false
        });
                
        fetch(            
                `http://localhost:8080/api/lesson/update/`,
                {
                method: 'POST',  
                body: jBody,  
                headers:{
                'Content-Type': 'application/json' 
                }
        })
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); //                     
                              
        this.setState({
            isAPIDone: true
        });

        this.modifyForm.reset();    
              
    }

    render() {
        if (this.state.isAPIDone === false) {
            return null;
        }

        if (this.state.doRedirect === true) {
            //this.setState( {doRedirect: false });
            return (<Redirect to="/" />);
        }

        const {selectedOption} = this.state;
        const {selectedOption2} = this.state;

        return (
          <div className="bgLesson" >                  
            <div
                style={{
                flex: 1,
                marginLeft: 30,
                width: 700,
                height: 700,
                display: 'inline-block',
                color: 'white' 
                }}
                > 
                 <p>{this.props.match.params.courseNo} Lesson Details</p>  
                    <form  ref={(input) => {this.modifyForm = input}} className="form"
                     onSubmit={(e)  => {this.modifyLesson(e)}}>
                        <div className="form-group row">
                            <div className="col-8">
                            <label className="label" htmlFor="newItemInput">Lesson No:</label>
                            <input required min="1" max="25"
                            type="number" placeholder="Lesson No."  className="form-control" id="lessonNo"
                            style={{width: 60}}
                            value={this.state.lessonNo.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span className="error" aria-live="polite">{this.state.validation1Msg}</span>
                            </div>                                    
                            <label className="label" htmlFor="newItemInput">Name:</label>
                            <input required maxLength="25"
                            type="text" placeholder="Lesson name"  className="form-control" id="lessonName"
                            style={{width: 400}}
                            value={this.state.lessonName.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span className="error" aria-live="polite">{this.state.validation2Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Description:</label>
                            <textarea   
                            rows="3"placeholder="Note" className="form-control" id="lessonDesc" 
                            style={{width: 400}}
                            value={this.state.lessonDesc} onChange={(value) => this.handleFormChange(value)} />
                            <label className="label" htmlFor="newItemInput">Project:</label>
                            <Select 
                            id="projectNo"
                            style={{width: 120}}  value={selectedOption} 
                            options={this.state.options}                           
                            onChange={(value) => this.handleSelectProjectChange(value)} />  
                            <label className="label" htmlFor="newItemInput">Task:</label>
                            <Select 
                            id="taskNo"
                            style={{width: 120}}  value={selectedOption2} 
                            options={this.state.options2}                           
                            onChange={(value) => this.handleSelectTaskChange(value)} />                       
                            <br/>
                            <button type="submit" className="btn btn-pri">{this.state.buttonText}</button>
                            <br/>
                            </div>
                        </div>
                    </form> 
                </div>     
          </div>
        );            
    }
}

export default LessonDetails;