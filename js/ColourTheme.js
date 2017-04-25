var header = document.getElementById("header");
var light_btn = document.getElementById("lightSkin");
var dark_btn = document.getElementById("darkSkin")

$("#lightSkin").click(function () {

    header.style.background = "#e0e0d1";

    //Lighter colour for buttons and hover   
    light_btn.style.background = "#8a8a5c";
    dark_btn.style.background = "#8a8a5c";
  
    $("#lightSkin").hover(function () {
        $(this).css("background", "#0066ff"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#8a8a5c"); //back to light theme colour when not hovering
    });
    $("#darkSkin").hover(function () {
        $(this).css("background", "#0066ff"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#8a8a5c"); //back to light theme colour when not hovering
    });

    /*SET SIDE AND BOTTOM MENU BACKGROUND COLOURS*/
    $(".side_menu").each(function () {
        $(this).css("background", "#b8b894");
    });

    $("#bottom_menu").each(function () {
        $(this).css("background", "#b8b894");
    });
    /*SET SIDE AND BOTTOM MENU BACKGROUND COLOURS*/

    //Menu item list items background i.e. the box that contains the options e.g. light sliders
    $(".menu_item > li").each(function () {
        $(this).css("background", "#8a8a5c");
    });

    //Each subsequent list item set to same background colour
    $(".menu_item > li > ul > li").each(function () {
        $(this).css("background", "#8a8a5c");
    });

    //List item links background colour + darker text colour e.g. wireframe mode, phong shading
    $(".menu_item > li > a").each(function () {
        $(this).css("background", "#e0e0d1");
        $(this).css("color", "#000000");
    });

    //Hovering over list item links e.g. wireframe mode, phong shading
    $(".menu_item li a").hover(function () {
        $(this).css("background", "#cce6ff"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#e0e0d1"); //back to light theme colour when not hovering
    });

    /***BOTTOM MENU***/
    //list items background i.e. the box that contains the options e.g. light sliders
    $(".bottom_menu_item > li").each(function () {
        $(this).css("background", "#8a8a5c");
    });

    //Each subsequent list item set to same background colour
    $(".bottom_menu_item > li > ul > li").each(function () {
        $(this).css("background", "#8a8a5c");
    });

    //List item links background colour + darker text colour e.g. wireframe mode, phong shading
    $(".bottom_menu_item > li > a").each(function () {
        $(this).css("background", "#e0e0d1");
        $(this).css("color", "#000000");
    });

    //Hovering over list item links e.g. wireframe mode, phong shading
    $(".bottom_menu_item li a").hover(function () {
        $(this).css("background", "#cce6ff"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#e0e0d1"); //back to light theme colour when not hovering
    });

});

$("#darkSkin").click(function ()
{
    header.style.background = "#3d5c5c";

    //Lighter colour for buttons and hover
    light_btn.style.background = "#3d5c5c";
    dark_btn.style.background = "#3d5c5c";

    $("#lightSkin").hover(function () {
        $(this).css("background", "#494a4c"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#3d5c5c"); //back to light theme colour when not hovering
    });
    $("#darkSkin").hover(function () {
        $(this).css("background", "#494a4c"); //Light blue colour on hover
    }, function () {
        $(this).css("background", "#3d5c5c"); //back to light theme colour when not hovering
    });

    /*SET SIDE AND BOTTOM MENU BACKGROUND COLOURS*/
    $(".side_menu").each(function () {
        $(this).css("background", "#494a4c");
    });

    $("#bottom_menu").each(function () {
        $(this).css("background", "#494a4c");
    });
    /*SET SIDE AND BOTTOM MENU BACKGROUND COLOURS*/

    //Menu item list items background except the first (so that header remains different colour)
    $(".menu_item > li").not(":first").each(function () {
        $(this).css("background", "#1d1e1e");
    });

    //Each subsequent list item set to same background colour
    $(".menu_item > li > ul > li").each(function () {
        $(this).css("background", "#1d1e1e");
    });

    //List item links background colour + darker text colour e.g. wireframe mode, phong shading
    $(".menu_item > li > a").each(function () {
        $(this).css("background", "#1d1e1e");
        $(this).css("color", "#fff");
    });

    //Hovering over list item links e.g. wireframe mode, phong shading
    $(".menu_item li a").hover(function () {
        $(this).css("background", "#494a4c"); 
    }, function () {
        $(this).css("background", "#1d1e1e");
    });

    /*********BOTTOM MENU********/

    //list items background i.e. the box that contains the options e.g. light sliders
    $(".bottom_menu_item > li").each(function () {
        $(this).css("background", "#1d1e1e");
    });

    //Each subsequent list item set to same background colour
    $(".bottom_menu_item > li > ul > li").each(function () {
        $(this).css("background", "#1d1e1e");
    });

    //List item links background colour + darker text colour e.g. wireframe mode, phong shading
    $(".bottom_menu_item > li > a").each(function () {
        $(this).css("background", "#1d1e1e");
        $(this).css("color", "#fff");
    });

    //Hovering over list item links e.g. wireframe mode, phong shading
    $(".bottom_menu_item li a").hover(function () {
        $(this).css("background", "#494a4c");
    }, function () {
        $(this).css("background", "#1d1e1e");
    });



});