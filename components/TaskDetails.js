import React, { Component } from 'react';
import {    
    Redirect
  } from "react-router-dom";
import { of } from 'rxjs';
import {
   catchError  
} from 'rxjs/operators';
import Select from 'react-select';
import Task from '../models/Task';
import learner from '../../smartlearn/learner';
import ProjectStyles from '../styles/projectStyles.css';
import validationStyles from '../styles/validationStyles.css'; 

class TaskDetails extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            id: ' ',
            taskNo: ' ',
            projectNo: ' ',
            lessonNo: ' ',
            learnerNo: ' ',            
            options: [],                         
            taskName: ' ',
            taskDesc: ' ',
            taskPctDone: ' ',
            buttonText: 'Add',
            validation1Msg: '',
            validation2Msg: '',
            validation3Msg: '',
            selectedOption: null,
            doRedirect: false, 
            isAPIDone: false                            
        };
    }

    componentWillMount() {
        this.setState({
            isAPIDone: true
        });      
        this.setState( {projectNo: this.props.match.params.projectNo });
        if (!(this.props.match.params.id === '0')) {            
            var serviceURL = 'http://localhost:8080/api/task/ById/'
             +  this.props.match.params.id;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeTaskDetailSetState(res);
                });                              
        }    
    }
    
    initializeTaskDetailSetState(taskDetail) {      
        const preSelectLearnerNo = taskDetail.learnerNo;
        this.setState({
            id: taskDetail.id,
            taskNo: taskDetail.taskNo, 
            projectNo: taskDetail.projectNo,
            lessonNo: taskDetail.lessonNo,
            learnerNo: taskDetail.learnerNo,
            taskName: taskDetail.taskName,
            taskDesc: taskDetail.taskDesc,
            taskPctDone: taskDetail.taskPctDone,  
            selectedOption: preSelectLearnerNo,           
            buttonText: 'Update'        
          });      
          this.initializeLearnerSelectLoad();                
    } 
    
    initializeLearnerSelectLoad() {
        this.setState({
            isAPIDone: false
        });
        var serviceURL = 'http://localhost:8080/api/learner/learners';  
            
        fetch(
           serviceURL                                  
           )              
         .then(res => res.json())              
         .then(res => {this.initializeLearnerSelectsSetState(res)} );
        
         this.setState({
            isAPIDone: true
          });
    }
    
    initializeLearnerSelectsSetState(learnerList) {    
        var filteredList = learnerList.map((item, index) => (
            {value: item.learnerNo, label: item.learnerName}          
        ));  
        const preSelectLearnerNo = this.state.learnerNo;
        var preSelectLearnerName = ' ';
        learnerList.map((item, index) => 
            {if (item.learnerNo === preSelectLearnerNo)  
                {
                    preSelectLearnerName = item.learnerName;
                }}
        );  
        const preSelectLearner = {value: preSelectLearnerNo, label: preSelectLearnerName};
        window.options = learnerList;  
        this.setState({   
            selectedOption: preSelectLearner             
        });   
        this.setState({   
              options: filteredList             
        });
    }

    handleFormChange(e) {
        const tID =  e.target.id;
        const value = e.target.value;
        const target = e.target;
        var valMsg = target.validationMessage;

        if (tID === "taskNo") {
            this.setState({taskNo: value}); 
            if (valMsg.includes("format")) {
                valMsg = valMsg + " should be like '999999' ";
            }
            this.setState({
                validation1Msg: valMsg 
            });   
        }
        if (tID === "lessonNo") {
            this.setState({lessonNo: value});   
        }
        if (tID === "learnerNo") {
            this.setState({learnerNo: value});
            this.setState({
                validation2Msg: target.validationMessage 
            });      
        }       
        if (tID === "taskName") {
           this.setState({taskName: value}); 
           this.setState({
            validation2Msg: target.validationMessage 
            });     
        }
        if (tID === "taskDesc") {
           this.setState({taskDesc: value});     
        } 
        if (tID === "taskPctDone") {
            this.setState({taskPctDone: value});
            if (valMsg.includes("format")) {
                valMsg = valMsg + " enter a valid pct from 0 to 100 ";
            }
            this.setState({
                validation3Msg: valMsg 
            });        
        }                
    }

    handleSelectLearnerChange = (selectedOption) => {
        this.setState({ selectedOption });
        this.setState({ learnerNo: selectedOption.value });
      }
  
    modifyTask(e) {
        if (!(this.props.match.params.id === '0')) {
            this.updateTask(e)
        }
        else {
            e.preventDefault();
            var task = Task; 
            task.id = this.state.id;
            task.taskNo = this.state.taskNo;
            task.projectNo =  this.state.projectNo;
            task.lessonNo = this.state.lessonNo;
            task.learnerNo = this.state.learnerNo;
            task.taskName = this.state.taskName;
            task.taskDesc = this.state.taskDesc;  
            task.taskPctDone = this.state.taskPctDone;   
            
            const jBody = JSON.stringify(task);

            this.setState({
                isAPIDone: false
            });
            
            fetch(            
                `http://localhost:8080/api/task/add/`,
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

    updateTask(e) {   
        var task = Task; 
        task.id = this.state.id;
        task.taskNo = this.state.taskNo;
        task.projectNo = this.state.projectNo;
        task.lessonNo = this.state.lessonNo;
        task.learnerNo = this.state.learnerNo;
        task.taskName = this.state.taskName;
        task.taskDesc = this.state.taskDesc;  
        task.taskPctDone = this.state.taskPctDone;

        const jBody = JSON.stringify(task);

        this.setState({
            isAPIDone: false
        });
                
        fetch(            
                `http://localhost:8080/api/task/update/`,
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

    render() {
        if (this.state.isAPIDone === false) {
            return null;
        }
        
        if (this.state.doRedirect === true) {           
            return (<Redirect to="/projects" />);
        }

        const {selectedOption} = this.state;

        return (
          <div  className="bgProject">         
            <br/>       
            <div
                style={{
                flex: 1,
                marginLeft: 30,
                width: 700,
                display: 'inline-block',
                color: 'white'
                }}
                > 
                    <h3>{this.props.match.params.projectNo} Task Details</h3>  
                    <form  ref={(input) => {this.modifyForm = input}} className="form"
                     onSubmit={(e)  => {this.modifyTask(e)}}>
                        <div className="form-group row">
                            <div className="col-8">
                            <label className="label" htmlFor="newItemInput">Task No:</label>
                            <input required pattern="[0-9]{6}" maxLength="6"
                            type="text" placeholder="Task No."  className="form-control" id="taskNo"
                            style={{width: 100}}
                            value={this.state.taskNo.trimLeft()} onChange={(value) => this.handleFormChange(value)} />                                                          
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation1Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Name:</label>
                            <input required maxLength="25"
                            type="text" placeholder="Task name"  className="form-control" id="taskName"
                            style={{width: 300}}
                            value={this.state.taskName.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation2Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Learner:</label>
                            <Select 
                            id="learnerNo"
                            style={{width: 120}}  value={selectedOption} 
                            options={this.state.options}                           
                            onChange={(value) => this.handleSelectLearnerChange(value)} />
                            <label className="label" htmlFor="newItemInput">Description:</label>
                            <textarea   
                            rows="3"placeholder="Note" className="form-control" id="taskDesc" 
                            style={{width: 600}}
                            value={this.state.taskDesc} onChange={(value) => this.handleFormChange(value)} />                       
                            <br/>
                            <label className="label" htmlFor="newItemInput">Pct Done:</label>
                            <input required min="0" max="100"
                            type="number" placeholder="0"  className="form-control" id="taskPctDone"
                            style={{width: 80}}
                            value={this.state.taskPctDone} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation3Msg}</span>
                            </div> 
                            <br/>
                            <button type="submit"   style={{background: "lightgray"}}
                            className="btn btn-pri">{this.state.buttonText}</button>
                            <br/>
                            </div>
                        </div>
                    </form> 
                </div>     
          </div>
        );            
    }
}

export default TaskDetails;