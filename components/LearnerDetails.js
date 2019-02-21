import React, { Component, Fragment } from 'react';

import {
     Redirect
  } from "react-router-dom";
import { of } from 'rxjs';
import {  
  catchError  
} from 'rxjs/operators';
import Validate from "react-validate-form";
import LearnerStyles from '../styles/learnerStyles.css';
import validationStyles from '../styles/validationStyles.css';
import Learner from '../models/Learner';

const errprMessages = {
    msg1: "Learner No. must be in form at Lnnn.",
}

class LearnerDetails extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            id: ' ',
            learnerNo: ' ',
            learnerName: ' ',
            learnerNote: ' ',
            buttonText: 'Add',
            isFormValid: false,
            validation1Msg: '',
            validation2Msg: '',
            doRedirect: false                     
        };
    }

    componentWillMount() {
        if (!(this.props.match.params.id === '0')) {
            var serviceURL = 'http://localhost:8080/api/learner/ById/'
             +  this.props.match.params.id;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeLearnerDetailSetState(res);
                });                      
        }    
    }
    
    initializeLearnerDetailSetState(learnerDetail) {      
        this.setState({
            id: learnerDetail.id,
            learnerNo: learnerDetail.learnerNo,
            learnerName: learnerDetail.learnerName,
            learnerNote: learnerDetail.learnerNote,            
            buttonText: 'Update'        
          });             
    }  

    handleFormChange(e) {
        const tID =  e.target.id;
        const value = e.target.value;
        const target = e.target;
        var valMsg = target.validationMessage;
    
        if (tID === "learnerNo") {
            this.setState({learnerNo: value}); 
            if (valMsg.includes("format")) {
                valMsg = valMsg + " should be like 'L999' ";
            }
            this.setState({
                validation1Msg: valMsg 
            });  
        }
        if (tID === "learnerName") {
           this.setState({learnerName: value});
           this.setState({
            validation2Msg: target.validationMessage 
            });   
        }
        if (tID === "learnerNote") {
           this.setState({learnerNote: value});     
        }                   
    }
  
    modifyLearner(e) {
        if (!(this.props.match.params.id === '0')) {
            this.updateLearner(e)
        }
        else {
            e.preventDefault();
            var learner = Learner; 
            learner.id = this.state.id;
            learner.learnerNo = this.state.learnerNo;
            learner.learnerName = this.state.learnerName;
            learner.learnerNote = this.state.learnerNote;     
            
            const jBody = JSON.stringify(learner);
            
            fetch(            
                `http://localhost:8080/api/learner/add/`,
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

    updateLearner(e) {   
        var learner = Learner; 
        learner.id = this.state.id;
        learner.learnerNo = this.state.learnerNo;
        learner.learnerName = this.state.learnerName;
        learner.learnerNote = this.state.learnerNote;  

        const jBody = JSON.stringify(learner);
                
        fetch(            
                `http://localhost:8080/api/learner/update/`,
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
          <div class="bglearner">           
            <div
                style={{
                flex: 1,
                marginLeft: 30,
                width: 600,
                height: 900,
                display: 'inline-block',
                color: 'white' 
                }}
                > 
                    <p>Learner Details</p> 
                    <form  ref={(input) => {this.modifyForm = input}} className="form"
                     onSubmit={(e)  => {this.modifyLearner(e)}} noValidate>
                        <div className="form-group">
                            <div className="col-8">
                            <br/>
                            <label className="label" htmlFor="newItemInput">Acct No:</label>
                            <input required pattern="L[0-9]{3}"
                            type="text" placeholder=" "  className="form-control" id="learnerNo"
                            name="learnerNo" style={{width: 80}}
                            value={this.state.learnerNo.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite"> {this.state.validation1Msg}</span> 
                            </div>                               
                            <br/>
                            <label className="label" htmlFor="newItemInput">Name:</label>
                            <input required pattern="*[A-Za-z]" maxLength="20"
                            type="text" placeholder="John Smith"  className="form-control" id="learnerName"
                            style={{width: 250}}
                            value={this.state.learnerName.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite"> {this.state.validation2Msg}</span>  
                            </div> 
                            <br/>
                            <label className="label" htmlFor="newItemInput">Note:</label>
                            <textarea   
                            rows="3" placeholder="Note" className="form-control" id="learnerNote" 
                            style={{width: 500, height: 80}}
                            value={this.state.learnerNote} onChange={(value) => this.handleFormChange(value)} />
                            </div>
                        </div>
                        <br/>
                        <button type="submit" className="btn btn-pri">{this.state.buttonText}</button>
                        <br/><br/>
                    </form> 
                </div>     
          </div>
        );            
    }
}

export default LearnerDetails;