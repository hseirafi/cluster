# node-cluster-seed
	
	- A simple seed project for quickly getting started with node-cluster.	

	- Current version is tested with Node v0.10.21 and above.

	- Presented example uses Express for the worker.


###Descrition on repo contents
-------------------------------

 1. cluster.js 
 				- Main file which is responsible for forking worker processes and managing them.
 				- Contains separate sections for the tasks to be done while in master process and for the tasks to be done while in worker process.
 				- Master process forks workers equal to the number of CPUs in the running environment.
 				- Has configuarable scheduling algorithm setting.
 				- Contains all essential life cycle methods like fork,online,exit,etc., in the master process.
 				- The example presented has a simple tracker module that keeps track of all the HTTP requests received by all workers.	

 2. worker.js
 				- This file contains all the chores that each worker has to perform when spawn.
 				- In the example presented, each worker reports to master on every incoming request that it receives. 

 3. enums.js
 				-  Helper to hold address type mapper and the similars.


###How to run
--------------

* env NODE_CLUSTER_SCHED_POLICY="none" node cluster //  to let operating system decide on the scheduling policy

* env NODE_CLUSTER_SCHED_POLICY="rr" node cluster // to force round-robin manually

* node cluster // Naa, I don't care what scheduling policy will be used. ;)


###Todo's
---------
    - Write tests
    - Add code comments
    - Rethink optimizations

