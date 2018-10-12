// Import the page's CSS. Webpack will know what to do with it.
//import '../css/app.css';
//require('../css/app.css');

// Import libraries we need.
//import { default as Web3} from 'web3';
Web3=require('web3');

//var Sync = require('sync');
//import { default as contract } from 'truffle-contract'

contract =require('truffle-contract');
// Import our contract artifacts and turn them into usable abstractions.
//import voting_artifacts from '../../build/contracts/CastYourVote.json';
var voting_artifacts = require( "../../build/contracts/CastYourVote.json");

var Voting = contract(voting_artifacts);

var candidateList = ["User1"]; 



window.onload = function() {
	window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
	Voting.setProvider(web3.currentProvider);
//Voting.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));
	console.log("hello world 1");
	
	// checking for initial candidate
	initialCheck();
	//document.getElementById('candidate-0').innerHTML="0";
	Voting.deployed().then(function(votes) {
		console.log("deployed ");
		votes.totalVotesReceived.call(candidateList[0]).then(function(res){
			document.getElementById('candidate-0').innerHTML=res;
			//$("candidate-0").html=(res.toString());
			console.log("inside deployed totalVotesReceived vkm = "+res.toString());
		});  ///
	});
	
}
// */
// checking for any candidate exist in block or not
initialCheck = function()
{
	//console.log("vkm candidate= "+num_candidate);
	Voting.deployed().then(function(votes){
		votes.numberOfCandidate.call().then(function(num){
			if(num>0){
				for(var i=1;i< (num);i++){
					initialUpdate(i);
				}
			}
			//console.log("initial candidate number : "+num);
		});
	});
}

function initialUpdate(i){
	console.log("initial update i="+i);
	Voting.deployed().then(function(voteObj){
		voteObj.nameOfCandidate.call(i).then(function(name){
			addingRow(name,i);
			candidateList.push(name);
			updateVotes(name);
			//console.log("initial candidate name : "+name+" at index :"+i);
		});
	});
}
/*
npm install requirejs
npm install uniq
browserify app.js -o bundle.js
<script language="JavaScript" type="text/javascript" src="javascripts/bundle.js"></script>
*/
addCandidate = function(candidate){
	//console.log("vkm addCandidate");
	var candidate_name=($('#newCandidate').val());
	addingRow(candidate_name,candidateList.length);
	candidateList.push(candidate_name);
	
	Voting.deployed().then(function(votes){
		console.log("length of list is: "+candidateList.length);
		votes.addCondidates(candidate_name,{from: web3.eth.accounts[0]}).then(function(){
			console.log("adding name ="+candidate_name);
		});
	});
	$('#newCandidate').val('');
	console.log("Add andidate: "+candidateList);
	updateVotes(candidate_name);
}

// adding row to the table
addingRow = function(candidateName,index){
	var table=document.getElementById('myTable');
	var row= table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	cell1.innerHTML = candidateName;
	cell2.setAttribute('id','candidate-'+index);
}

voteForCandidate = function(candidate)
{
	var candidate_name=$('#oldCandidate').val();
	//console.log("voting for: "+candidate_name);
	Voting.deployed().then(function(votes){
		votes.voteFor(candidate_name,{from: web3.eth.accounts[0]}).then(function(){
			console.log("voting done for = "+candidate_name);
		});
		$('#oldCandidate').val('');
	});
	
	updateVotes(candidate_name);
}



updateVotes =function(candidateName)
{
	Voting.deployed().then(function(votes){
		votes.totalVotesReceived.call(candidateName).then(function(result){
			console.log("number of votes for "+candidateName+" is :"+result);
			for(var i=0;i<candidateList.length;i++){
				if(candidateName==candidateList[i]){
					document.getElementById('candidate-'+i).innerHTML=result;
					break;
				}
			}
		});
	});
}


/* Register  ------------------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//
*/

registerClick = function()
{
	var pubID = $('#input_public_id').val();
	var priID= $('#input_private_id').val();
	console.log("pub :"+pubID+" pri:"+priID);
	Voting.deployed().then(function(votes){
		votes.userExist.call(pubID).then(function(res){
			console.log("userExist: "+res);
			if(res==false){
				addNewUser(pubID,priID);
			}
		});
	});
}

addNewUser = function(pubID,priID){
	//balance = web3.eth.getBalance(someAddress);  // for gas balance
	Voting.deployed().then(function(add){
		add.newRegistration(pubID,priID,{from: web3.eth.accounts[1],gas:3000000}).then(function(){
			console.log("registration successful:"+pubID+" and "+priID);
		});
	});
}

checkUser = function(pubID){
	Voting.deployed().then(function(votes){
		votes.userExist.call(pubID).then(function(res){
			return res;
		});
	});
}

// Exchanging money ---------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exchangeMoneyClick =function(){
	var userPubID = $('#exch_pub_id').val();
	var amountEx = $('#exch_amount_id').val();
	var adminID = $('#admin_pri_id').val();
	Voting.deployed().then(function(votes){
		votes.userExist.call(userPubID).then(function(res){
			console.log("user existence check:"+res);
			if(res==true){
				checkAdmin(userPubID,amountEx,adminID);
			}
		});
	});
}

checkAdmin = function(userPubID,amountEx,adminID){
	Voting.deployed().then(function(check){
		check.checkingAdmin.call(adminID).then(function(ress){
			console.log("admin check:"+ress);
			if(ress==true){
				transferMoney(userPubID,amountEx);
			}
		});
	});
}

transferMoney = function(userPubID,amountEx,adminID){
	Voting.deployed().then(function(trans){
		trans.amountAdd(userPubID,amountEx,{from: web3.eth.accounts[2],gas:3000000}).then(function(){
			console.log("transfer successful:"+userPubID+" amt: "+amountEx);
		});
	});
}


// voting ---------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// taking inputs and checking voted or not
addBetClick =function(selected_index){
	console.log("betting index:"+selected_index);
	var pubID = $('#input_account_id').val();
	var priID = $('#input_private_id').val();
	var betAmount = $('#input_betPrice_id').val();
	// check pubID user already voted or not
	Voting.deployed().then(function(check2){
		check2.checkingVotedOrNot.call(pubID).then(function(res2){
			console.log("voted or not :"+res2);
			if(res2==false){
				checkingPublicPrivateAndAmount(pubID,priID,betAmount,selected_index);
			}
		});
	});
	
}

// for checking public, private, and balance of pubIDs
checkingPublicPrivateAndAmount = function(pubID,priID,betAmount,selected_index){
	Voting.deployed().then(function(check){
		check.checkPubPriIDAmount.call(pubID,priID,betAmount).then(function(ress){
			console.log("checkingPublicPrivateIDAmount check:"+ress);
			if(ress==true){
				minimumBetAmnt(pubID,priID,betAmount,selected_index);
			}
		});
	});
}


// checking minimum bet amount 
minimumBetAmnt= function(pubID,priID,betAmount,selected_index){
	Voting.deployed().then(function(check1){
		check1.minimumBetCheck.call(betAmount).then(function(res1){
			console.log("minimumBetCheck: "+res1);
			if(res1==true){
				makingVote(pubID,betAmount,selected_index);
			}
		});
	});
}



// making vote of pubID for selected_index
makingVote = function(pubID,betAmount,selected_index){
	Voting.deployed().then(function(voteIndex){
		voteIndex.makingVoteForSelectedIndex(pubID,betAmount,selected_index,{from: web3.eth.accounts[1],gas:3000000}).then(function(){
			console.log("makingVoteForSelectedIndex successful");
		});
	});
}

//------------------------------------------------------------>>>>>>>>>>>>>>>>

// for checking balance of user 
checkBalanceClick=function(){
	var pubID=$('#balanceCheckPubID').val();
	Voting.deployed().then(function(check){
		check.userBalanceCheck.call(pubID).then(function(bal){
			console.log("balance of "+pubID+" :"+bal);
			if(bal==98765421239874473652)
				document.getElementById("outputBalace").innerHTML= "<span style='color:red;'> This account does not exist.</span>";
			else
				document.getElementById("outputBalace").innerHTML=bal;
		});
	});
}



//User Record  --------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// showing user record
userRecordClick = function(){
	var pubID= $('#userRecord_pub_id').val();
	console.log("pubID: "+pubID);
	Voting.deployed().then(function(votes){
		votes.userExist.call(pubID).then(function(res){
			console.log("userExist: "+res);
			if(res==true){
				showUserMatchDetail(pubID);
			}
		});
	});
}

showUserMatchDetail = function(pubID){
	Voting.deployed().then(function(find1){
		find1.findingNumOfMatchUserPlayed.call(pubID).then(function(numOfMatch){
			console.log("number of matches: "+numOfMatch);
			if(numOfMatch>0){
				for(var i=0;i<numOfMatch;i++){
					addUserRecaordTableRow(i);
					updatingUserRowdetail(pubID,i,0);
					updatingUserRowdetail(pubID,i,1);
					updatingUserRowdetail(pubID,i,2);
					updatingUserRowdetail(pubID,i,3);
				}
			}
		});
	});
}

addUserRecaordTableRow =function(index){
	var table=document.getElementById('userRecordTable');
	var row= table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	cell1.setAttribute('id','match-'+index);
	cell2.setAttribute('id','amountBet-'+index);
	cell3.setAttribute('id','select-'+index);
	cell4.setAttribute('id','amountGain-'+index);
}

updatingUserRowdetail= function(pubID,index,columnNum){
	Voting.deployed().then(function(find1){
		find1.findingUserRowRecord.call(pubID,index,columnNum).then(function(value){
			console.log("index:"+index+" columnNum:"+columnNum+" value: "+value);
			if(columnNum==0){
				document.getElementById('match-'+index).innerHTML=value;
			}
			else if(columnNum==1){
				document.getElementById('amountBet-'+index).innerHTML=value;
			}
			else if(columnNum==2){
				document.getElementById('select-'+index).innerHTML=value;
			}
			else if(columnNum==3){
				document.getElementById('amountGain-'+index).innerHTML=value;
			}
		});
	});
}