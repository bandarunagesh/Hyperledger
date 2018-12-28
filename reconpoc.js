//Ensure that undeclared variables are not used in the code
'use strict'

//Import requiried libs
const shim = require('fabric-shim');
const util = require('util');

//Define Chaincode Methods
let Chaincode = class {
    async Init(stub){
       //Get the user entered chaincode function name and parameters     
       let ret = stub.getFunctionAndParameters();
       //Omit the provided details to console
       console.info(ret);
       console.info('================= Instantiated Chain Code =========');
       //Return the results. show the message in buffer.
       return shim.success(Buffer.from('Init sucessful'));

    }

    //Inove the client request
    async Invoke(stub){
        console.info('============ Invoke Started==========');
        console.info(`Transaction ID: ${stub.getTxID()}`);
        console.info(util.format('Args: %j',stub.getArgs()));

        //get the user entered deteails to ret object
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        //take the function name passed in cli
        let chainmethod = this[ret.fcn];
        if(!chainmethod){
            console.info(`no function of name: ${ret.fcn}`);    
            return shim.error(err);
        } 
        try{
            
            let payload = await chainmethod(stub, ret.params,this);
            return shim.success(payload);
            console.info('=================Invoke Completed =========')

        } catch(err){
            console.log(err);
            return shim.error(err);
        }

    }

//Writing transactions (Functions)
async createApplication(stub,args,thisClass){
    //defining asset
    console.info('================= Create Application Started =========')

    let application={};
    let ask_id = args[0].toLowerCase();
    application.docType='Application';
    application.Formal_Name = args[1];
    application.Category = args[3];
    application.Purpose = args[4];
    application.App_Lifecycle_Status = args[5];
    application.Decommission_Status = args[6];
    application.Attestation_Object_Owner = args[7];
    application.IT_Development_Owner = args[8];
    application.Business_Owner = args[9];
    application.Finance_Approver = args[10];
    application.GL_Mapping = args[11];
    application.Businessj_Segment = args[12];
    application.GL_Code = args[13];
    application.Start_Date = args[14];
    application.End_Date = args[15];
    application.Status = args[16];
    application.TMDB_Reference = args[17];
    
    await stub.putState(ask_id,Buffer.from(JSON.stringify(application)));;
    
    console.info(`Application asset is created ${JSON.stringify(application)}`)
    console.info('================= Create Application Completed =========')
    //Create Composit Key to retrive all the Applications in the system
   /*
    let indexName = 'docType~ask_id'
    let askidDoctypeIndexKey = await stub.createCompositeKey(indexName,[application.docType, application.ask_id]);
    console.info(askidDoctypeIndexKey);
    console.info('================= Index Completed =========')
    
    await stub.putState(askidDoctypeIndexKey,Buffer.from(JSON.stringify(application)));
    console.info('================= Updated state =========')
    */
}


async createInfrastructure(stub,args,thisClass){
    console.info('================= Create Infra Started =========')

    let infraStructure={};
    infraStructure.docType='Infrastructure';
    let servername = args[0].toLowerCase();
    
    await stub.putState(servername,Buffer.from(JSON.stringify(infraStructure)));
    console.info(`Infracture is created ${JSON.stringify(infraStructure)}`)
    console.info('================= Create Infra Completed =========')

}


async createMappingTable(stub,agrs,thisClass){
    console.info('================= Create Mapping Table Started =========')

    let mappingTable = {};
    mappingTable.docType ='Mapping_Table';
    let SUI = args[0].toLowerCase();
    mappingTable.Application = args[1];
    mappingTable.Infrastructure = args[2];

    await stub.putState(SUI,Buffor.from(JSON.stringify(mappingTable)));
    console.info(`Mapping table has been created ${JSON.stringify(mappingTable)}`);
    console.info('================= Create Mapping table Completed =========')

}

async getApplication(stub,args,thisClass){

    console.info('================= Query Application Started =========')

    let ask_id = args[0].toLowerCase();
    if(!ask_id){
        throw new Error('Please enter the ask_id to query data');
    }
    let results = await stub.getState(ask_id);
    if (!results.toString()){
        throw new Error('There are no results retrived for this id '+ask_id);
    }
    console.info('================= Query Application Ended =========')
    return results;

}

async getAllApplications(stub,args,thisClass){
    let docinput = args[0]
    let resultIterator = stub.getStateByPartialCompositeKey('doctype~ask',[docinput]);
    let finaloutput =[];
    while(true){
        let response = await resultIterator.next();
        if(!response || !response.value || !response.value.key){
            return finaloutput;;
        }

        console.info(response.value);
        console.info(response.key);
        console.info(response.value.key);
        finaloutput.push(response.value);
    }
     
}
async getInfrastructure(stub,agrs,thisClass){
    console.info('================= Query Infra Started =========')
    let servername = args[0].toLowerCase();
    if (!servername){
        throw new Error('This server is not available in the system: '+ servername);
    }

    let results = await stub.getState(servername);
    if(!results.toString()){
        throw new Error('no results found');
    }
    console.info('================= Query Infra Ended =========')
    return results;
}

async getMappingTable(stub,args,thisClass){
    console.info('================= Query Mapping Table Started =========')
    let sui = args[0].toLowerCase();
    if (!sui){
        throw new Error('please provide valide SUI');
    }

    let results = stub.getState(sui);
    if (!results.toString()){
        throw new Error('no results found')
    }
    console.info('================= Query Mapping Table Ened =========')
    return results;
}

};

shim.start(new Chaincode());