<?php
function customLogin() {
    global $wpdb;
    $passcode = $_REQUEST['passcode'];
    $passcode = esc_sql( $passcode );
    $row = $wpdb->get_row("select ID, Party from wp_GUESTS where passcode = '" . $passcode . "'");
    if(is_null($row->ID)){
	  echo json_encode( false );
	}
    else {
	  session_start();
	  $_SESSION["ID"] = $row->ID;
	  $_SESSION["Party"] = $row->Party;
	  echo json_encode( $_SESSION["ID"] );
	}
    wp_die(); 
}
add_action('wp_ajax_custlog', 'customLogin');
add_action('wp_ajax_nopriv_custlog', 'customLogin');

function getParty() {
  global $wpdb;
  session_start();
  $partyid = $_SESSION["Party"];
  $sql = "SELECT Name FROM wp_PARTY WHERE ID = '" . $partyid . "'";
  $party = $wpdb->get_row($sql);
  echo json_encode( $party->Name );
  wp_die(); 
}
add_action('wp_ajax_getparty', 'getParty');
add_action('wp_ajax_nopriv_getparty', 'getParty');

function getInfo() {
  global $wpdb;
  session_start();
  $id = $_REQUEST['id'];
  $sql = "SELECT First_Name, Last_Name, Email, Cell, Is_Attending FROM wp_GUESTS WHERE ID = '" . $id . "'";
  $row = $wpdb->get_row($sql);
  $info = array($row->First_Name, $row->Last_Name, $row->Email, $row->Cell, $row->Is_Attending);
  echo json_encode( $info );
  wp_die(); 
}
add_action('wp_ajax_getinfo', 'getInfo');
add_action('wp_ajax_nopriv_getinfo', 'getInfo');

function getPartyMembers() {
  global $wpdb;
  session_start();
  $partyid = $_SESSION["Party"];
  $sql = "SELECT wp_GUESTS.ID, wp_GUESTS.First_Name, wp_GUESTS.Last_Name, wp_GUESTS.Email, wp_GUESTS.Cell, wp_GUESTS.Is_Attending, wp_PLUS_ONES.Guest_ID FROM wp_GUESTS LEFT OUTER JOIN wp_PLUS_ONES ON wp_GUESTS.ID = wp_PLUS_ONES.Guest_ID WHERE Party = '" . $partyid . "'";
  $members = $wpdb->get_results($sql);
  $membersinfo = array();
  foreach($members as $member) {
	$memberinfo = array($member->ID, $member->First_Name, $member->Last_Name, $member->Email, $member->Cell, $member->Is_Attending, $member->Guest_ID);
	array_push($membersinfo, $memberinfo);
  }
  echo json_encode( $membersinfo );
  wp_die(); 
}
add_action('wp_ajax_getmembers', 'getPartyMembers');
add_action('wp_ajax_nopriv_getmembers', 'getPartyMembers');

function getPlusOne() {
  global $wpdb;
  session_start();
  $id = $_REQUEST['id'];
  $sql = "SELECT First_Name, Last_Name, Is_Attending FROM wp_PLUS_ONES WHERE Guest_ID = '" . $id . "'";
  $row = $wpdb->get_row($sql);
  $info = array($row->First_Name, $row->Last_Name, $row->Is_Attending);
  echo json_encode( $info );
  wp_die(); 
}
add_action('wp_ajax_getplusone', 'getPlusOne');
add_action('wp_ajax_nopriv_getplusone', 'getPlusOne');

function updateGuest() {
  global $wpdb;
  session_start();
  $id = $_REQUEST['id'];
  $email = $_REQUEST['email'];
  $cell = $_REQUEST['cell'];
  $name = $_REQUEST['name'];
  $isattending = $_REQUEST['isattending'];
  $result = $wpdb->update(
    'wp_GUESTS', 
    array( 
        'Email' => $email,
        'Cell' => $cell,
        'Is_Attending' => $isattending,
    ), 
    array(
        "ID" => $id
    ) 
  );
  $to = 'sister.wedding.2017@gmail.com';
  $subject = $name . ' has RSVPd Yes';
  $message = "Name: " . $name . "\r\n RSVP: Yes \r\n Email: " . $email . "\r\n Phone: " . $cell;  
  if ($isattending == 0){
	$subject = $name . ' has RSVPd No';
	$message = "Name: " . $name . "\r\n RSVP: No \r\n Email: " . $email . "\r\n Phone: " . $cell;  
  }
  wp_mail($to, $subject, $message);
}
add_action('wp_ajax_updateguest', 'updateGuest');
add_action('wp_ajax_nopriv_updateguest', 'updateGuest');

function updatePlusOne() {
  global $wpdb;
  session_start();
  $id = $_REQUEST['id'];
  $fname = $_REQUEST['fname'];
  $lname = $_REQUEST['lname'];
  $isattending = $_REQUEST['isattending'];
  $result = $wpdb->update(
    'wp_PLUS_ONES', 
    array( 
        'First_Name' => $fname,
        'Last_Name' => $lname,
        'Is_Attending' => $isattending,
    ), 
    array(
        "Guest_ID" => $id
    ) 
  );
}
add_action('wp_ajax_updateplusone', 'updatePlusOne');
add_action('wp_ajax_nopriv_updateplusone', 'updatePlusOne');



