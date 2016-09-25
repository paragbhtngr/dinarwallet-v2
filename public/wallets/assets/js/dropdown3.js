var subs_array = new Array("sub_dnc","sub_eth","sub_btc","sub_gsc","sub_dnd");// Put the id's of your hidden divs in this array



function displaySubs(the_sub){

	 if (document.getElementById(the_sub).style.display==""){

	   document.getElementById(the_sub).style.display = "";return

  }

  for (i=0;i<subs_array.length;i++){

	   var my_sub = document.getElementById(subs_array[i]);

	   my_sub.style.display = "none";

	 }

  document.getElementById(the_sub).style.display = "";

}


