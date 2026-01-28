<template>
 <div class="card" style="margin-top: 100px;">
    <div class="card-header">
                <h4 class="card-title fw-bolder fs-4">test</h4>
            </div>
    <div class="card-body">
        <nav>
  <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
    <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Questionnaire Responses</button>
    <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Risk Assessment</button>
  </div>
</nav>
<div class="tab-content" id="nav-tabContent">
  <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
    <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label for="" class="d-inline">AssetName</label>
                                    <select name="asset_id" readonly disabled required class="form-control select2 select2-hidden-accessible" id="" data-select2-id="1" tabindex="-1" aria-hidden="true">
                                        <option value="" data-select2-id="3"></option>
                                    </select><span class="select2 select2-container select2-container--default select2-container--disabled" dir="ltr" data-select2-id="2" style="width: 272.5px;"><span class="selection"><span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="-1" aria-disabled="true" aria-labelledby="select2--container"><span class="select2-selection__rendered" id="select2--container" role="textbox" aria-readonly="true"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
                                </div>
                            </div>

                        </div>
                       
                       <div class="answer">
                        <div class="form-group">
                                <label for="">
                                    <span class="badge badge-light-warning " style="font-size: 15px">1</span>
                                    <span class="" style="font-size: 15px; font-weight: bold">
                                        Do you actively manage (inventory, track, and correct) all software on the network so that only authorized software is installed and can execute, and that unauthorized and unmanaged software</span>
                                </label>
                            </div>
                            <input type="radio" disabled readonly name="questions[1][answers]" value="3" id="answer_3">
                            <label for="answer_3">Yes</label>
                            <br/>
                            <input type="radio" disabled readonly name="questions[1][answers]" value="4" id="answer_4">
                            <label for="answer_4">No</label>
                            <br/>
                            <a download="Do you actively manage (inventory, track, and correct) all software on the network so that only authorized software is installed and can execute, and that unauthorized and unmanaged softwarequestion_file" target="_blank" href="https://advancedcontrols.sa/grc_v3_dev/public/">view File</a>
                       </div>
  </div>  
  <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
    <section id="accordion">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div id="accordionWrapa1" role="tablist" aria-multiselectable="true">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h4 class="card-title"></h4>
                                                    </div>
                                                    <div class="card-body">
                                                        <p class="card-text"></p>
                                                        <div class="accordion" id="accordionExample">
                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingOne">
                                                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordionOne" aria-expanded="true" aria-controls="accordionOne">
                                                                        Analysis
                                                                    </button>
                                                                </h2>
                                                                <div id="accordionOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        <table class="table table-striped table-bordered">

                                                                            <tbody><tr><td></td>
                                                                            <td>Total Number</td>
                                                                            


                                                                            </tr></tbody><tbody>
                                                                                <tr>
                                                                                    <td>AllRisks</td>
                                                                                    <td>0</td>
                                                                                    
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Added Risks</td>
                                                                                    <td>0
                                                                                    </td>
                                                                                    
                                                                                </tr>

                                                                                <tr>
                                                                                    <td>Pending Risks</td>
                                                                                    <td>0
                                                                                    </td>
                                                                                    
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Rejected Risks</td>
                                                                                    <td>0
                                                                                    </td>
                                                                                    
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingTwo">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionTwo" aria-expanded="false" aria-controls="accordionTwo">
                                                                        Pending Risks
                                                                    </button>
                                                                </h2>
                                                                <div id="accordionTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">

                                                                        <div class="row">

                                                                                                                                                            No Risks Found
                                                                            

                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingThree">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionThree" aria-expanded="false" aria-controls="accordionThree">
                                                                        Added Risks
                                                                    </button>
                                                                </h2>
                                                                <div id="accordionThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">


                                                                                                                                                    No Risks Found
                                                                        
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingFour">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionFour" aria-expanded="false" aria-controls="accordionFour">
                                                                        Rejected Risks
                                                                    </button>
                                                                </h2>
                                                                <div id="accordionFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">

                                                                                                                                                    No Risks Found
                                                                                                                                            </div>
                                                                </div>
                                                            </div>

                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingFive">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionFive" aria-expanded="false" aria-controls="accordionFive">
                                                                        Compliance Assessment
                                                                    </button>
                                                                </h2>

                                                                <div id="accordionFive" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        
                                                                        <h2>Associated Controls</h2>
                                                                        <table class="table  table-bordered">

                                                                            <thead>
                                                                                <tr><th>Associated Frameworks
                                                                                </th>
                                                                                <th>Control</th>
                                                                                <th>Status</th>
                                                                            </tr></thead>
                                                                            <tbody>

                                                                                

                                                                            </tbody>

                                                                        </table>
                                                                    </div>
                                                                </div>


                                                            </div>

                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingSix">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionSix" aria-expanded="false" aria-controls="headingSix">
                                                                        Maturity Assessment
                                                                    </button>
                                                                </h2>

                                                                <div id="accordionSix" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        
                                                                        
                                                                        <table class="table  table-bordered">

                                                                            <thead>
                                                                                <tr><th>Associated Frameworks
                                                                                </th>
                                                                                <th>Current Control Maturity
                                                                                </th>
                                                                                <th>Desired Control Maturity
                                                                                </th>
                                                                            </tr></thead>
                                                                            <tbody>


                                                                                

                                                                            </tbody>

                                                                        </table>
                                                                    </div>
                                                                </div>


                                                            </div>
                                                            <div class="accordion-item">
                                                                <h2 class="accordion-header" id="headingseven">
                                                                                                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionseven" aria-expanded="false" aria-controls="accordionseven">
                                                                            Risks
                                                                        </button>
                                                                                                                                    </h2>

                                                                <div id="accordionseven" class="accordion-collapse collapse" aria-labelledby="headingseven" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        <div class="card-datatable">
                                                                            <table class="dt-advanced-server-search table" id="dataTable">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>#</th>
                                                                                        <th>Risk Number</th>
                                                                                        <th>Subject</th>
                                                                                        <th>Description
                                                                                        </th>
                                                                                        <th>Category</th>
                                                                                        <th>Status</th>
                                                                                        <th>Responsible Party
                                                                                        </th>
                                                                                        <th>Inherent Risk Current
                                                                                        </th>
                                                                                        <th>Submission Date
                                                                                        </th>
                                                                                        
                                                                                        
                                                                                        <th>Actions</th>

                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                                                                                                                                                                                        </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
  </div>
  
</div>
    </div>
 </div>
</template>
<style>
.nav-tabs .nav-item.show .nav-link, 
.nav-tabs .nav-link.active {
  position: relative;
}

.nav-tabs .nav-item.show .nav-link::after, 
.nav-tabs .nav-link.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, rgba(71,37,94,1) 0%, rgba(160,142,172,1) 100%);
}
.badge.badge-light-warning {
    background-color: rgba(255, 159, 67, 0.12);
    color: #ff9f43 !important;
}
</style>