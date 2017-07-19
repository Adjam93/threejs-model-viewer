$(document).ready(function () {

    $(".menu_item > li > a").on("click", function (e) {

        if (!$(this).hasClass("active")) {

            // hide any open menus and remove all other classes
            $(".menu_item li ul").slideUp(350);
            $(".menu_item li a").removeClass("active");

            // open new menu and add the open class
            $(this).next("ul").slideDown(350);
            $(this).addClass("active");
            $(".side_menu").niceScroll({ horizrailenabled: false }); //add jquery nicescroll with horizontal scroll disabled
            
        } else if ($(this).hasClass("active")) {

            $(this).removeClass("active");
            $(this).next("ul").slideUp(350);
        }
    });

    $(".bottom_menu_item > li > a").on("click", function (e) {

        if (!$(this).hasClass("active")) {

            // hide any open menus and remove all other classes
            $(".bottom_menu_item li ul").slideUp(350);
            $(".bottom_menu_item li a").removeClass("active");

            // open new menu and add the open class
            $(this).next("ul").slideDown(350);
            $(this).addClass("active");
            $("#bottom_menu").niceScroll();

        } else if ($(this).hasClass("active")) {

            $(this).removeClass("active");
            $(this).next("ul").slideUp(350);
        }
    });
});
