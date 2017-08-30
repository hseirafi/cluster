
"use strict";

var cluster = require('cluster')
	, numCPUs = require('os').cpus().length
	, worker = require('./worker.js')
	, Enums = require('./enums');

/*  cluster scheduling policy configuration */
cluster.schedulingPolicy = process.env.NODE_CLUSTER_SCHED_POLICY || cluster.SCHED_NONE; // cluster.SCHED_RR

/* code to run if we're in the master process */
if(cluster.isMaster){

	/* creating a worker process in each available CPU */
	for(var i = 0; i < numCPUs; i++){		
		cluster.fork();
	}

	/* master emits this event for every worker fork */
	cluster.on('fork', function(worker) { 
		console.log('\nMaster : Worker ' + worker.id + ' fork success, now checking...');
	});

	/* master emits this event on receiving 'online' msg from every worker it just forked */
	cluster.on('online', function(worker) {
  		console.log('\nMaster : Worker ' + worker.id + ' responded back after it was forked');
	});

	/* emitted when master comes to know about worker, on listening */
	cluster.on('listening', function(worker, address) {
 		console.log('\nMaster : Worker ' + worker.id + ' is now connected @ ' + address.address + ':' + address.port + ' #' + Enums.addressType[address.addressType]);
	});	

	/* emitted on every worker disconnect */
	cluster.on('disconnect', function(worker, code, signal) {
	    console.log('\nMaster : Worker ' + worker.pid + '(processId:' + worker.process.id +')'+' has disconnected');
	});

	/* emitted when any error is occured in workers */
	cluster.on('error', function(worker) {
 		console.log('\nMaster : Error occured in worker ' + worker.id );
	});

	/* emitted when any worker dies */
	cluster.on('exit', function(worker, code, signal) {	
		if (worker && worker.suicide === true) {
   			console.log('\nMaster : Worker %d (processId:%d) just suicided (%s)....', worker.id, worker.process.pid, signal || code);
   		}
  		else{
			console.log('\nMaster : Worker %d (processId:%d) died (%s). Restarting...', worker.id, worker.process.pid, signal || code);

	    	/* replace the disconnected worker with a new one */
			cluster.fork();
		}
	});

	/* utility to track HTTP requests received by all workers so far */
	var runMasterRequestTracker = function (timer) {
		
		/* Keep track of http requests */
		var numReqs = 0;
		var requestHosts = [];
		setInterval(function() {
			console.log("\nMaster-HTTP-Request-Tracker reports total no. of requests so far as ", numReqs);
			requestHosts.forEach(function(host, index){
				console.log('Host ' +  (index+1) + ': ' + host.hostName + ' / ' + host.hostIp);
			});
		}, timer);

		/* count requests received by every workers*/
	  	var messageHandler = function(msg) {
	   		if (msg.cmd && msg.cmd.indexOf('notifyRequest') > -1) {
	      		numReqs += 1;
	      		var splits = msg.cmd.split(',');
	      		requestHosts.push({hostName :splits[1], hostIp : splits[2]});
	      	}
	  	}	

		Object.keys(cluster.workers).forEach(function(id) {
	    	cluster.workers[id].on('message', messageHandler);
	 	});
	};

	runMasterRequestTracker(10000);	

}else if(cluster.isWorker){ /* code to run when in worker process  */
	
	worker.init(cluster.worker.id); /* initialize worker */
} 

