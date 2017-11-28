var chat = new function() {
	
	var customerDbOnline = true;
	var tabTitle = $( "#tab_title" );
	var tabContent = $( "#tab_content" );
	var tabTemplate = "<li class='ui-state-default ui-ta ui-closable-tab ui-tabs-selected ui-state-active'><a href='#{href}' id='#{liId}' userId='#{userId}'>#{label}</a> <span class='ui-icon ui-icon-close' onclick='chat.closeTab(this)'></span></li>";
	var softwareWorkstations="";
	
    this.init = function() {

		if (typeof sessvars.chat == 'undefined'){
			sessvars.chat = {};
		}
		if (typeof sessvars.chat.tabs == 'undefined'){
		sessvars.chat.tabs = new Array();
		}
		if (typeof sessvars.chat.tabCounter == 'undefined'){
			sessvars.chat.tabCounter = 0;
		}
	};

	// On F5 we do not want to loose all chat information, so this is retrieving the history of the session and putting it back into the chat window
	this.restoreTabs = function(){
		if (typeof sessvars.chat == 'undefined'){
			sessvars.chat = {};
		}
		if (typeof sessvars.chat.tabs == 'undefined'){
		sessvars.chat.tabs = new Array();
		}
		if (typeof sessvars.chat.tabCounter == 'undefined'){
			sessvars.chat.tabCounter = 0;
		}

		for (var i=0;i<sessvars.chat.tabCounter;i++){
			this.restoreTab(sessvars.chat.tabs[i]);
		}
		$("#messageText").val("");
	}
	
	this.closeTab = function (linkElement){		
		//there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
		li = linkElement.parentNode;
		tab = $(li).find("a").attr("href");
        $(li).remove(); // remove li of tab        
        $('#tabs a:last').show(); // Select last tab
		$(tab).remove(); //remove respective tab content
		
		var found;
		for (var i=0;i<sessvars.chat.tabCounter;i++){
			var tabRef = "#"+sessvars.chat.tabs[i].tabRef;
			if (tabRef == tab)
				found = i;
		}
		for (var i=found;i<sessvars.chat.tabCounter-found;i++){
			sessvars.chat.tabs[i] = sessvars.chat.tabs[i+1];
		}

		if (sessvars.chat.tabCounter == 0){
			$("#messageText").hide();		
			$("#messageText").val("");		
		}

	}
	
	this.showAvailableUsers = function(){
		var params = {};
		params.branchId = parseInt(sessvars.branchId);
		var users = spService.get("branches/"+sessvars.branchId+"/users");
		var html = "<hr><span class='colorAll' id='ALL' onclick=\"chat.addTab('ALL','"+jQuery.i18n.prop('info.chat.send.to.all')+"','colorAll');\">" + jQuery.i18n.prop('info.chat.send.to.all') + "</span><hr>";
		for (var i=0;i<users.length;i++){
			if (users[i].id != sessvars.currentUser.id){
				var color="color"+users[i].id;
				html += "<span class='"+color+"'"+"onclick=\"chat.addTab('"+users[i].id+"','"+users[i].userName+"','"+color+"');\" id='"+users[i].id+"'>" + users[i].userName + "</span><br>"
			}
		}		
		$("#nameList").html(html);
	}
	
	this.restoreTab = function(info){
		//$("#sendButton").removeAttr("disabled");
		$("#messageText").show();
		var tabs = $( "#tabs" );
		var label = info.userName;
		var id = info.tabRef;
		var li = $( tabTemplate.replace( /#\{liId\}/g, "li#" + id ).replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ).replace(/#\{userId\}/g, info.userId) );
		var tabContentHtml = info.content;
		tabs.find( ".ui-tabs-nav" ).append( li );
		tabs.append( "<div id='" + id + "'>" + tabContentHtml + "</div>" );
		$('#tabs ul li a').click(function(){ // When link is clicked
			$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
			$(this).parent().addClass('ui-tabs-selected ui-state-active'); //Set parent of clicked link class to active
			var currentTab = $(this).attr('href'); // Set currentTab to value of href attribute
			currentTab = currentTab.substring(currentTab.indexOf("#"));
			$('#tabs div').hide(); // Hide all divs
			$(currentTab).show(); // Show div with id equal to variable currentTab
			return false;
		});
		var currentTab = "#"+id; // Set currentTab
		$('#tabs div').hide(); // Hide all divs
		$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
		li.addClass('ui-tabs-selected ui-state-active'); //Set parent of clicked link class to active
		$(currentTab).css("height","100px");
		$(currentTab).css("overflow","auto");
		$(currentTab).show();
		$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
	}
	
	this.addTab = function(userId, userName, color){
		//check if tab for that user id already exists
		util.hideModal("chatPartner");
		var found = chat.findExistingTab(userId);
		if (found)
			return;
	
		// Enable Send button
		$("#messageText").show();
		var tabs = $( "#tabs" );
		var label = userName;
		var id = "tabs-" + sessvars.chat.tabCounter;
		var li = $( tabTemplate.replace( /#\{liId\}/g, "li#" + id ).replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ).replace(/#\{userId\}/g, userId) );	
		var tabContentHtml = tabContent.val() || "";
		tabs.find( ".ui-tabs-nav" ).append( li );
		tabs.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
		$('#tabs ul li a').click(function(){ // When link is clicked
			$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links			
			$(this).parent().addClass('ui-tabs-selected ui-state-active'); //Set parent of clicked link class to active
			var currentTab = $(this).attr('href'); // Set currentTab to value of href attribute
			currentTab = currentTab.substring(currentTab.indexOf("#"));
			$('#tabs div').hide(); // Hide all divs
			$(currentTab).show(); // Show div with id equal to variable currentTab
			return false;
		});
		var currentTab = "#"+id; // Set currentTab
		$('#tabs div').hide(); // Hide all divs
		$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
		li.addClass('ui-tabs-selected ui-state-active'); //Set parent of clicked link class to active
		$(currentTab).css("height","100px");
		$(currentTab).css("overflow","auto");
		$(currentTab).show();
		$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
		// Now save in session
		sessvars.chat.tabs[sessvars.chat.tabCounter] = {};
		sessvars.chat.tabs[sessvars.chat.tabCounter].tabRef=id;
		sessvars.chat.tabs[sessvars.chat.tabCounter].userId=userId;
		sessvars.chat.tabs[sessvars.chat.tabCounter].userName=userName;
		sessvars.chat.tabs[sessvars.chat.tabCounter].content=tabContentHtml;
		sessvars.chat.tabs[sessvars.chat.tabCounter].color=color;
		sessvars.chat.tabCounter++;
		
		
	};
	
	this.findExistingTab = function(userId){
		var tabs = $( "#tabs" );
		var ul = tabs.find( ".ui-tabs-nav" );
		var field = $( "a[userid='"+userId+"']" );
		
		if (field.length != 0){
			var currentTab = field.attr("href");
			currentTab = currentTab.substring(currentTab.indexOf("#"));
			$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
			field.parent().addClass('ui-tabs-selected ui-state-active'); //Set parent of clicked link class to active			
			$('#tabs div').hide(); // Hide all divs
			$(currentTab).show(); // Show div with id equal to variable currentTab			
			return true;
		}
		else
			return false;
	}
	
	// Returns the current tab
	this.getCurrentTab = function() {
		var tabs = $( "#tabs" );
		var ul = tabs.find( ".ui-tabs-nav" );
		var currentTab = ul.find(".ui-state-active");
		var a = currentTab.find("a");
		var tab = a.attr("href");
		return tab;
	}
	
	// gets the user that this message should be send to from the current tab
	this.getTargetUser = function () {
		var tabs = $( "#tabs" );
		var ul = tabs.find( ".ui-tabs-nav" );
		var currentTab = ul.find(".ui-state-active");
		var a = currentTab.find("a");
		return (a.attr("userId"));
	}
	
	// Send a message via chat
	this.sendMessage = function (){
		var message = $("#messageText").val();
		message = message.replace(/</g,'');
		message = message.replace(/>/g,'');
		message = message.replace(/"/g,'');
		if (message.length > 0) {
		var unitId = sessvars.servicePointUnitId;
		var currentTab = this.getCurrentTab();
		currentTab = currentTab.substring(currentTab.indexOf("#"));
		var now = new Date();
		var html = util.formatDateIntoHHMMSS(now);
		html += "&nbsp;";
		html += "<span class='colorMySelf'>&lt;"+sessvars.currentUser.userName+"&gt</span>&nbsp;"+message+"<br>"; 
		$(currentTab).css("height","100px");
		$(currentTab).css("overflow","auto");
		$(currentTab).append(html);
		$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
		$("#messageText").val("");
		//update the session var
		var tabRef = $(currentTab).attr("id");
		for (var i=0;i<sessvars.chat.tabCounter;i++){
			if (sessvars.chat.tabs[i].tabRef == tabRef)
				sessvars.chat.tabs[i].content = $(currentTab).html();
		}

		var userId = this.getTargetUser();
		var sender = sessvars.currentUser.id;
		if (softwareWorkstations == "") {
			var params = {};
			params.branchId = parseInt(sessvars.branchId);
			params.deviceType = "SW_SERVICE_POINT";
  		    softwareWorkstations = spService.get("branches/" +sessvars.branchId+ "/servicePoints/deviceTypes/SW_SERVICE_POINT");
		 }

		for (var i=0;i<softwareWorkstations.length;i++){
			var unitId = softwareWorkstations[i].unitId;
			if (unitId != sessvars.servicePointUnitId){
				var sendChatEvent =  {"M":"E","E":{"evnt":"CHAT_SEND","type":"APPLICATION", "prm":{"receiver":userId,"message":message,"sender":sender}}};
				sendChatEvent.E.prm.uid = softwareWorkstations[i].unitId + ":SW_SERVICE_POINT";
				qevents.publish('/events/APPLICATION', sendChatEvent);
			}
		}		
			}
	};
	
	// finds the user name for a given user id in the list of available chat users
	this.findUserName = function(userId){
		var name = "#"+userId;
		var userName = $(name).text();
		if (typeof userName == "undefined"){
			chat.showAvailableUsers();
			var userName = $(name).text();
		}
		return userName;
	}
	
	// finds the colour that was used in the available chat users list for the given userId
	this.findUserColor = function(userId){
		var name = "#"+userId;
		var userColor = $(name).attr("class");
		return userColor;
	}
	
	// Receive and handle the chat event
	this.receiveEvent = function(eventObject){		
		switch(eventObject.E.evnt) {
			case "CHAT_RECEIVE":				
				var senderUserId = eventObject.E.prm.sender;
				var receiverUserId = eventObject.E.prm.receiver;
				var message=eventObject.E.prm.message;

				if (receiverUserId == sessvars.currentUser.id)
				{
					var found = false;
					for (var i=0;i<sessvars.chat.tabCounter;i++){
						if (sessvars.chat.tabs[i].userId == senderUserId){
							$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
							var currentTab = "#"+sessvars.chat.tabs[i].tabRef ;
							var liTab = "li#"+sessvars.chat.tabs[i].tabRef ;
							var field = $( "a[id='"+liTab+"']" );
							field.parent().addClass('ui-tabs-selected ui-state-active');

							$('#tabs div').hide(); // Hide all divs		
							var now = new Date();						
							var html = util.formatDateIntoHHMMSS(now);
							html += "&nbsp;";
							html += "<span class='"+sessvars.chat.tabs[i].color+"'>&lt;"+sessvars.chat.tabs[i].userName+"&gt</span>&nbsp;"+message+"<br>"; 
							$(currentTab).css("height","100px");
							$(currentTab).css("overflow","auto");
							$(currentTab).append(html);
							$(currentTab).show(); // Show div with id equal to variable currentTab
							$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
							sessvars.chat.tabs[i].content = $(currentTab).html();
							found = true;
						}
					}
					if (!found){
					// tab doesnot exist create a new one
						var userName = this.findUserName(senderUserId);
						var userColor = this.findUserColor(senderUserId);
						this.addTab(senderUserId,userName, userColor);
						var currentTab = this.getCurrentTab();
						currentTab = currentTab.substring(currentTab.indexOf("#"));
						var now = new Date();
						var html = util.formatDateIntoHHMMSS(now);
						html += "&nbsp;";
						html += "<span class='"+userColor+"'>&lt;"+userName+"&gt</span>&nbsp;"+message+"<br>"; 
						$(currentTab).css("height","100px");
						$(currentTab).css("overflow","auto");
						$(currentTab).append(html);
						$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
						sessvars.chat.tabs[sessvars.chat.tabCounter-1].content = $(currentTab).html();					
					}	
				}
				else if (receiverUserId == "ALL"){

					var found = false;
					for (var i=0;i<sessvars.chat.tabCounter;i++){
						if (sessvars.chat.tabs[i].userId == "ALL"){
							$('#tabs ul li').removeClass('ui-tabs-selected ui-state-active'); // Remove active class from links
							var currentTab = "#"+sessvars.chat.tabs[i].tabRef ;
							var liTab = "li#"+sessvars.chat.tabs[i].tabRef ;
							var field = $( "a[id='"+liTab+"']" );
							field.parent().addClass('ui-tabs-selected ui-state-active');

							$('#tabs div').hide(); // Hide all divs		
							var userName = this.findUserName(senderUserId);
							var userColor = this.findUserColor(senderUserId);
							var now = new Date();						
							var html = util.formatDateIntoHHMMSS(now);
							html += "&nbsp;";
							html += "<span class='"+userColor+"'>&lt;"+userName+"&gt</span>&nbsp;"+message+"<br>"; 
							$(currentTab).css("height","100px");
							$(currentTab).css("overflow","auto");
							$(currentTab).append(html);
							$(currentTab).show(); // Show div with id equal to variable currentTab
							$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
							sessvars.chat.tabs[i].content = $(currentTab).html();
							found = true;
						}
					}
					if (!found){
						var branchName = this.findUserName("ALL");
						var userName = this.findUserName(senderUserId);
						var userColor = this.findUserColor(senderUserId);
						this.addTab("ALL",branchName, userColor);
						var currentTab = this.getCurrentTab();
						currentTab = currentTab.substring(currentTab.indexOf("#"));
						var now = new Date();
						var html = util.formatDateIntoHHMMSS(now);
						html += "&nbsp;";
						html += "<span class='"+userColor+"'>&lt;"+userName+"&gt</span>&nbsp;"+message+"<br>"; 
						$(currentTab).css("height","100px");
						$(currentTab).css("overflow","auto");
						$(currentTab).append(html);
						$(currentTab).scrollTop($(currentTab)[0].scrollHeight);
						sessvars.chat.tabs[sessvars.chat.tabCounter-1].content = $(currentTab).html();					
					}		
				}				
				break;			
			default:
				break;
		}
	};
}