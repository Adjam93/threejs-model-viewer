$(document).ready(function () {

    $(".menu_item > li > a").on("click", function (e) {

        if (!$(this).hasClass("active")) {

            // hide any open menus and remove all other classes
            $(".menu_item li ul").slideUp(350);
            $(".menu_item li a").removeClass("active");

            // open new menu and add the open class
            $(this).next("ul").slideDown(350);
            $(this).addClass("active");

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

        } else if ($(this).hasClass("active")) {

            $(this).removeClass("active");
            $(this).next("ul").slideUp(350);
        }
    });

    $(".checkboxContainer").hover(
        function () {
            $(this).find(".infoCheckbox:first").show();
        },
        function () {
            $(this).find(".infoCheckbox:first").hide();
        }
    );
});