// Import the page's CSS. Webpack will know what to do with it.

Web3=require('web3');



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
	initialMarqueUpdate();
	
	
}

//--------------------------------------------------------------------------------------------------------------------------------------------------
function initialMarqueUpdate(){
	var marqMessage = document.getElementById('marq_message');
	var id2= document.getElementById('remaining_slot_id2');
	//marqMessage.innerHTML="hello";
	//console.log("initial marq=");
	Voting.deployed().then(function(obj){
		obj.currentMatchNumber.call().then(function(match){
			marqMessage.innerHTML="Casino Roulette is live !! Go Register Now and Bet.  \t    Good Luck !!";
			marqMessage.style.color="blue";
			id2.innerHTML= "Current Match : "+match;
			id2.style.color="#800000";
			remainingVoteUpdate();
			if(match > 1){
				previousAmountUpdate();
				previousWinnerUpdate();
			}
		});
	});
	
}

function remainingVoteUpdate(){
	var rvoteId = document.getElementById('remaining_slot_id');
	Voting.deployed().then(function(obj1){
		obj1.currentMatchRemainVote.call().then(function(vote){
			rvoteId.innerHTML="Winner will be announced after "+vote+" more votes.";
			rvoteId.style.color="#AB2CBF";
		});
	});
}

function previousAmountUpdate(){
	var prId1 = document.getElementById('prevId1');
	Voting.deployed().then(function(obj2){
		obj2.previousMatchAmount.call().then(function(amt){
			prevId1.innerHTML="Total Bet Amount : "+amt;
			prevId1.style.color="green";
		});
	});
}

function previousWinnerUpdate(){
	var rvoteId = document.getElementById('prevId2');
	Voting.deployed().then(function(obj3){
		obj3.previousMatchWinner.call().then(function(vote1){
			if(vote1==0) vote1=10;
			console.log("previous vote value = "+vote1);
			prevId2.innerHTML="Winner Bet Number : "+vote1;
			prevId2.style.color="green";
		});
	});
}

//---------------------------------------------------------------------------------------------------------------------------------------------------
/*
npm install requirejs
npm install uniq
browserify app.js -o bundle.js
<script language="JavaScript" type="text/javascript" src="javascripts/bundle.js"></script>
*/


/* Register  ------------------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//
*/

registerClick = function()
{
	var pubID = $('#input_public_id').val();
	var priID = $('#input_private_id').val();
	var conPriID = $('#confirm_private_id').val();
	var registerMessage = document.getElementById('register_message');
	if(pubID.trim().length==0 || (priID.trim().length==0|| conPriID.trim().length==0 )){
		registerMessage.innerHTML="Enter proper value";
		registerMessage.style.color="red";
	} 
	else if(pubID.trim().length < 5){
		registerMessage.innerHTML="Unsuccessful, UserID size should be atleat 5 !";
		registerMessage.style.color="red";
	}
	else if( priID.trim().length < 5){
		registerMessage.innerHTML="Unsuccessful, Password size should be atleat 5 !";
		registerMessage.style.color="red";
	}
	else if(priID == conPriID){
		console.log("pub :"+pubID+" pri:"+priID);
	  Voting.deployed().then(function(votes){
		votes.userExist.call(pubID).then(function(res){
			console.log("userExist: "+res);
			if(res==false){
				addNewUser(pubID,priID);
				registerMessage.innerHTML ="Registration Successful !"; 
				registerMessage.style.color="green";
			}
			else{
				registerMessage.innerHTML ="Already registered !"; 
				registerMessage.style.color="red";
			}
		});
	  });
	
	}
	else{
		registerMessage.innerHTML="Unsuccessful, Password does not match !";
		registerMessage.style.color="red";
	}
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

// Exchanging money ----------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exchangeMoneyClick =function(){
	var userPubID = $('#exch_pub_id').val();
	var amountEx = $('#exch_amount_id').val();
	var adminID = $('#admin_pri_id').val();
	var exchangeMessage= document.getElementById('exchange_message');
	if(userPubID.trim().length==0 || (amountEx.trim().length==0 || adminID.trim().length==0 )){
		exchangeMessage.innerHTML="Enter proper value !";
		exchangeMessage.style.color="red";
	}
	else if(isNormalInteger(amountEx)){
		Voting.deployed().then(function(votes){
			votes.userExist.call(userPubID).then(function(res){
				console.log("user existence check:"+res);
				if(res==true){
					checkAdmin(userPubID,amountEx,adminID);
				}
				else{
					exchangeMessage.innerHTML="User does not exist !";
					exchangeMessage.style.color="red";
				}
			});
		});
	}
	else{
		exchangeMessage.innerHTML="Amount should be positive integer! ";
		exchangeMessage.style.color="red";
	}
}

checkAdmin = function(userPubID,amountEx,adminID){
	var exchangeMessage= document.getElementById('exchange_message');
	Voting.deployed().then(function(check){
		check.checkingAdmin.call(adminID).then(function(ress){
			console.log("admin check:"+ress);
			if(ress==true){
				transferMoney(userPubID,amountEx);
				exchangeMessage.innerHTML="Transfer Successful !";
				exchangeMessage.style.color="green";
			}
			else{
				exchangeMessage.innerHTML="Wrong, Admin key!";
				exchangeMessage.style.color="red";
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


// voting --------------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// taking inputs and checking voted or not
addBetClick =function(selected_index){
	console.log("betting index:"+selected_index);
	var pubID = $('#input_account_id').val();
	var priID = $('#input_private_id').val();
	var betAmount = $('#input_betPrice_id').val();
	var voteMessage = document.getElementById('vote_message');
	// check pubID user already voted or not
	if(pubID.trim().length==0 ||(priID.trim().length==0|| betAmount.trim().length==0 ) ){
		voteMessage.innerHTML="Enter proper values!";
		voteMessage.style.color="red";
	}
	else if(isNormalInteger(betAmount)){
		Voting.deployed().then(function(check2){
			check2.checkingVotedOrNot.call(pubID).then(function(res2){
				console.log("voted or not :"+res2);
				if(res2==false){
					checkingPublicPrivateAndAmount(pubID,priID,betAmount,selected_index);
				}
				else{
					voteMessage.innerHTML="User, Already voted for this match !";
					voteMessage.style.color="red";
				}
			});
		});
	}
	else{
		voteMessage.innerHTML="Amount should be positive integer! ";
		voteMessage.style.color="red";
	}
	
}

// for checking public, private, and balance of pubIDs
checkingPublicPrivateAndAmount = function(pubID,priID,betAmount,selected_index){
	Voting.deployed().then(function(check){
		check.checkPubPriIDAmount.call(pubID,priID,betAmount).then(function(ress){
			console.log("checkingPublicPrivateIDAmount check:"+ress);
			if(ress==true){
				minimumBetAmnt(pubID,priID,betAmount,selected_index);
			}
			else{
				document.getElementById('vote_message').innerHTML="Public and private key mismatch or insufficient account balance!";
				document.getElementById('vote_message').style.color="red";
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
			else{
				document.getElementById('vote_message').innerHTML="Bet amount should be atleast 10";
				document.getElementById('vote_message').style.color="red";
			}
		});
	});
}



// making vote of pubID for selected_index
makingVote = function(pubID,betAmount,selected_index){
	console.log("index selected="+selected_index);
	Voting.deployed().then(function(voteIndex){
		voteIndex.makingVoteForSelectedIndex(pubID,betAmount,selected_index,{from: web3.eth.accounts[1],gas:3000000}).then(function(){
			console.log("makingVoteForSelectedIndex successful");
			if(selected_index==0) selected_index=10;
			document.getElementById('vote_message').innerHTML="Bet Successful, for number "+selected_index;
			document.getElementById('vote_message').style.color="green";
			initialMarqueUpdate();
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
			var position=document.getElementById("outputBalace");
			if(bal==98765421239874473652)
				position.innerHTML= "<span style='color:red;'> Account does not exist.</span>";
			else{
				position.innerHTML="Balance: "+bal;
				position.style.fontWeight='bold';
				position.style.fontSize=255;
				position.style.color='green';
			}
		});
	});
}

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
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
	//var table=document.getElementById('userRecordTable');
	var table=document.getElementById('userRecordTable').getElementsByTagName('tbody')[0];
	var row = table.insertRow(table.rows.length);
	
	//var row= table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var n
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