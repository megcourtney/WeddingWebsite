var userid;
var previd;
var hasplusone = false;
var guestType = 1;
var badlogins = 0;

if (sessionStorage.getItem("userid") !== null) {
    userid = sessionStorage.getItem("userid");
    previd = userid;
    populateForm();
}

jQuery("#passcode").keyup(function (event) {
    "use strict";
    if (event.keyCode === 13) {
        jQuery("#loginbutton").click();
    }
});

//logs the user in if passcode is in db
function login() {
    "use strict";
    var apasscode = jQuery("#passcode").val();
    jQuery.ajax({
        url: ajaxurl,
        type: "POST",
        cache: false,
        data: {action: "custlog", passcode: apasscode},
        success: function (loginSuccess) {
            if (loginSuccess === "false") {
                if(badlogins === 0){
                    jQuery("#login").append("<div class='center' style='color:red'>Invalid passcode</div>");
                    badlogins += 1;
                }
            }
            else {
                populateForm();
                userid = loginSuccess.replace(/["]+/g, "");
                previd = userid;
                sessionStorage.setItem('userid', userid);
            }
        }
    });
}

//populates the rsvp form and vertical menu after login
function populateForm() {
    "use strict";
    jQuery("#rsvp-container").removeClass("hidden");
    jQuery("#login-container").html("");
    jQuery.ajax({
        url: ajaxurl,
        type: "POST",
        cache: false,
        data: {action: "getparty"},
        success: function (partyName){
            jQuery("#party").html("<strong>"+ partyName.replace(/["]+/g, '') +"</strong><hr>");
        }
    });
    jQuery.ajax({
        url: ajaxurl,
        type: "POST",
        cache: false,
        data: {action: "getmembers"},
        dataType: "json",
        success: function (members) {
            jQuery("#partymenu").html("<div class='fl-module-content fl-node-content' id='cont'></div>");
            jQuery("#cont").html("<div class='fl-html' id='cont2'></div>");
            jQuery("#cont2").html("<table class='vertical-menu' id='vm'></table>");
            members.forEach(function (member) {
                var select = "";
                var thestatus = "&#10060;";
                var active = "";
                if (member[0] === userid) {
                    jQuery("#personal-header").html("RSVP for " + member[1] + " " + member[2] + "<hr>");
                    if (member[5] !== "0") {
                        jQuery("#rsvp-form").html("<input type='radio' name='rsvp' value='yes' checked='checked'> Attending<br><input type='radio' name='rsvp' value='no'> Not Attending<br>");
                    }
                    else {
                        jQuery("#rsvp-form").html("<input type='radio' name='rsvp' value='yes'> Attending<br><input type='radio' name='rsvp' value='no' checked='checked'> Not Attending<br>");
                    }
                    jQuery("#rsvp-form").append("<table id='formtab'></table>");
                    jQuery("#formtab").append("<tr id='namerow'><th class='center'><label>First Name</label><br><input id='fname' type='text' name='firstname' value='"+member[1]+"' readonly></th><th class='center'><label>Last Name</label><br><input id='lname' type='text' name='lastname' value='"+member[2]+"' readonly></th></tr>");
                    jQuery("#formtab").append("<tr id='contactrow'></tr>");
                    if (member[3] !== null) {
                        jQuery("#contactrow").append("<td><label>Email</label><br><input id='email' type='text' name='email' value = '"+member[3]+"'></td>");
                    }
                    else {
                        jQuery("#contactrow").append("<td><label>Email</label><br><input id='email' type='text' name='email'></td>");
                    }
                    if (member[4] !== null) {
                        jQuery("#contactrow").append("<td><label>Phone</label><br><input id='phone' type='text' name='phone' value = '"+member[4]+"'></td>");
                    }
                    else {
                        jQuery("#contactrow").append("<td><label>Phone</label><br><input id='phone' type='text' name='phone'></td>");
                    }
                    if (member[6] !== null) {
                        hasplusone = true;
                    }
                    jQuery("#rsvp-form").append("<input type='submit' value='RSVP' onclick='updateRSVP()'>");
                    jQuery("#rsvp-form").append("<div id='rsvpupdated' class='hidden' style='color:green'><br>RSVP was updated!<br>Thank you!</div>");
                    select = "&#10148;";
                    active = "active";
                }
                if(member[5]!=="0"){
                    thestatus = "&#9989;";
                }
                jQuery("#vm").append("<tr class = '"+ active +"' id='"+ member[0] +"' onclick=\"populateNewForm("+ member[0] + ", '" + member[1] + "', '" + member[2] + "', '" + member[3] + "', '" + member[4] + "', " + member[5] + ")\"><td class='status'>" + thestatus + "</td> <td class='name'>"+ member[1] + " " + member[2] +"</td><td class='select'>"+ select +"</td></tr>");
            });
            if (hasplusone === true) {
                populatePlusOne();
            }
            else {
                jQuery("#cont2").append("<button id='logout' class='center' onclick='logout()'>Log Out</button>");
            }
        }
    });
}

//occurs after clicking on a new party member, populates rsvp form
function populateNewForm(id, fname, lname, email, cell, isAttending) {
    "use strict";
    if (previd != id) {
        guestType = 1;
        changeActiveMenu(id);
        markRSVP(isAttending);
        prepRSVPForm(guestType);
        populateNameFields(fname, lname);
        populateContactFields(email, cell);
    }
}

//will load the plus one's info in menu or an add plus one button if no info is in db
function populatePlusOne(){
     "use strict";
     jQuery.ajax({
        url: ajaxurl,
        type: "POST",
        cache: false,
        data: {action: "getplusone", id: userid},
        dataType: "json",
        success: function (plusone) {
            var name = "";
            var thestatus = "&#9989;";
            var isAttending = true;
            if (plusone[0] !== null && plusone[0] !== "") {
                name = plusone[0] + " " + plusone[1];
            }
            if (plusone[2] === "0") {
                isAttending = false;
                thestatus = '&#10060;';
            }
            if (name === "" && isAttending === false) {
                jQuery("#cont2").append("<button class='plusone' onclick=\"addPlusOne('" + plusone[0] + "', '" + plusone[1] + "', " + isAttending + ")\">Add +1</button><hr>");
                jQuery("#cont2").append("<button id='logout' class='center' onclick='logout()'>Log Out</button>");
            }
            else if (name === "") {
                jQuery("#vm").append("<tr id='pone' onclick=\"populatePlusForm(this.id, '" + plusone[0] + "','" + plusone[1] + "'," + isAttending + ")\"><td class='status'>"+ thestatus +"</td> <td class='name'>Your Plus One</td><td class='select'></td></tr>");
                jQuery("#cont2").append("<button class='removeplusone' onclick='removePlusOne()'>Remove +1</button>");
                jQuery("#cont2").append("<button id='logout' class='center' onclick='logout()'>Log Out</button>");
            }
            else {
                jQuery("#vm").append("<tr id='pone' onclick=\"populatePlusForm(this.id, '" + plusone[0] + "','" + plusone[1] + "'," + isAttending + ")\"><td class='status'>"+ thestatus +"</td> <td class='name'>"+ plusone[0] + " " + plusone[1] +"</td><td class='select'></td></tr>");
                jQuery("#cont2").append("<button class='removeplusone' onclick='removePlusOne()'>Remove +1</button>");
                jQuery("#cont2").append("<button id='logout' class='center' onclick='logout()'>Log Out</button>");
            }

        }
    });
}

//occurs when user clicks on plus one's name in vertical menu, populates rsvp form
function populatePlusForm(id, fname, lname, isAttending) {
    "use strict";
    guestType = 2;
    changeActiveMenu(id);
    markRSVP(isAttending);
    prepRSVPForm(guestType);
    populateNameFields(fname, lname);
}

//adds a blank guest to the vertical menu, loads blank rsvp form
function addPlusOne(fname, lname, isAttending){
    "use strict";
    guestType = 2;
    jQuery(".plusone").remove();
    jQuery("#logout").remove();
    jQuery("#cont2").append("<button class='removeplusone' onclick='removePlusOne()'>Remove +1</button>");
    jQuery("#cont2").append("<button id='logout' class='center' onclick='logout()'>Log Out</button>");
    jQuery("#vm").append("<tr id='pone' onclick=\"populatePlusForm('pone', '" + fname + "', '" + lname + "', " + isAttending + ")\"><td class='status'>&#10060;</td> <td class='name'>Your Plus One</td><td class='select'></td></tr>");
    changeActiveMenu("pone");
    markRSVP(false);
    prepRSVPForm(guestType);
    populateNameFields(fname, lname);

}

//removes the plus one from the vertical menu and db
function removePlusOne(){
  "use strict";
  jQuery.ajax({
     url: ajaxurl,
     type: "POST",
     cache: false,
     data: {action: "updateplusone", id: userid, fname: '', lname: '', isattending: 0},
     dataType: "json",
     success: function (data) {
     }
   });
  populateForm();
}

//occurs when rsvp button is pressed; uploads info in fields to the db
function updateRSVP(){
  "use strict";
  var fname = jQuery("#fname").val();
  var lname = jQuery("#lname").val();
  var isattending = 0;
  if (jQuery("input[name='rsvp']:checked").val() === "yes"){
    isattending = 1;
  }
  if (guestType === 1) {
    var email = jQuery("input[name=email]").val();
    var cell = jQuery("input[name=phone").val();
    jQuery.ajax({
       url: ajaxurl,
       type: "POST",
       cache: false,
       data: {action: "updateguest", id: previd, email: email, cell: cell, isattending: isattending, name: fname + " " + lname},
       dataType: "json",
       success: function (data) {
         jQuery("#rsvpupdated").removeClass("hidden");
         updateMenu(fname, lname, isattending);
       }
    });
  }
  else if (guestType === 2) {
    jQuery.ajax({
       url: ajaxurl,
       type: "POST",
       cache: false,
       data: {action: "updateplusone", id: userid, fname: fname, lname: lname, isattending: isattending},
       dataType: "json",
       success: function (data) {
         jQuery("#rsvpupdated").removeClass("hidden");
         updateMenu(fname, lname, isattending);
       }
    });
  }
}

//logs user out
function logout(){
  "use strict";
  sessionStorage.removeItem("userid");
  sessionStorage.removeItem("previd");
  location.reload();
}

//functions only called by other functions

//Guest: guestType = 1, Plus One: guestType = 2
 function prepRSVPForm(guestType){
   "use strict";
   if (guestType === 1){
     jQuery("#contactrow").removeClass("hidden");
     jQuery("input[name=firstname]").prop("readonly", true);
     jQuery("input[name=lastname]").prop("readonly", true);
     jQuery("input[name=firstname]").css('color', '');
     jQuery("input[name=lastname]").css('color', '');
   }
   else if (guestType === 2) {
     jQuery("#contactrow").addClass("hidden");
     jQuery("input[name=firstname]").prop("readonly", false);
     jQuery("input[name=lastname]").prop("readonly", false);
     jQuery("input[name=firstname]").css('color', 'black');
     jQuery("input[name=lastname]").css('color', 'black');
   }
 }

//changes the active status of the guest menu
function changeActiveMenu(id){
  "use strict";
  jQuery("#rsvpupdated").addClass("hidden");
  jQuery("#" + previd).removeClass("active");
  jQuery("#" + id).addClass("active");
  jQuery("#" + id +" > td.select").html("&#10148;");
  jQuery("#" + previd +" > td.select").html("");
  previd = id;
  sessionStorage.setItem('previd', previd);
}

//checks appropriate RSVP radio button
function markRSVP(isAttending){
  "use strict";
  if (isAttending === false || isAttending === "false" || isAttending === 0 || isAttending === "0") {
      jQuery("input[name=rsvp][value=no]").attr("checked", "checked");
  }
  else {
      jQuery("input[name=rsvp][value=yes]").attr("checked", "checked");
  }
}

//populates header, first name, and last name fields
function populateNameFields(fname, lname){
  "use strict";
  var headerFill = false;
  if (fname === "" || fname === "null" || fname === null){
    jQuery("input[name=firstname]").val("");
    jQuery("#personal-header").html("RSVP for Your Plus One<hr>");
    headerFill = true;
  }
  else {
    jQuery("input[name=firstname]").val(fname);
  }
  if (lname === "" || lname === "null" || lname === null){
    jQuery("input[name=lastname]").val("");
    if(headerFill === false){
      jQuery("#personal-header").html("RSVP for " + fname + "<hr>");
      headerFill = true;
    }
  }
  else {
    jQuery("input[name=lastname]").val(lname);
  }
  if (headerFill === false) {
    jQuery("#personal-header").html("RSVP for " + fname + " " + lname + "<hr>");
  }
}

//populates email and phone fields
function populateContactFields(email, cell) {
  "use strict";
  if (email === "" || email === "null" || email === null){
    jQuery("input[name=email]").val("");
  }
  else {
    jQuery("input[name=email]").val(email);
  }
  if (cell === "" || cell === "null" || cell === null){
    jQuery("input[name=phone]").val("");
  }
  else {
    jQuery("input[name=phone]").val(cell);
  }
}

//updates menu after rsvp has been submitted
function updateMenu(fname, lname, isattending) {
  "use strict";
  if (guestType === 2) {
    if (fname !== "" && lname !== "") {
      jQuery("#personal-header").html("RSVP for " + fname + " " + lname + "<hr>");
      jQuery("#pone > td.name").html(fname + " " + lname);
    }
    else if (fname !== "") {
      jQuery("#personal-header").html("RSVP for " + fname + "<hr>");
      jQuery("#pone > td.name").html(fname);
    }
    else {
      jQuery("#personal-header").html("RSVP for Your Plus One<hr>");
      jQuery("#pone > td.name").html("Your Plus One");
    }
    var newFunction = "populatePlusForm('pone', '" + fname + "', '" + lname + "', " + isattending + ")";
    jQuery("#pone").attr("onclick", newFunction);
    if (isattending === 1) {
      jQuery("#pone > td.status").html("&#9989;");
    }
    else {
      jQuery("#pone > td.status").html("&#10060;");
    }

  }
  else if (guestType === 1) {
    var email = jQuery("input[name=email]").val();
    var cell = jQuery("input[name=phone").val();
    var anewFunction = "populateNewForm("+ previd + ", '" + fname + "', '" + lname + "', '" + email + "', '" + cell + "', " + isattending + ")";
    jQuery("#" + previd).attr("onclick", anewFunction);
    if (isattending === 1) {
      jQuery("#" + previd + " > td.status").html("&#9989;");
    }
    else {
      jQuery("#" + previd + " > td.status").html("&#10060;");
    }
  }
}
