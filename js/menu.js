$(document).ready(function () {

    $(".menu_item > li > a").on("click", function (e) {

        if (!$(this).hasClass("active")) {

            // hide any open menus and remove all other classes
            $(".menu_item li ul").slideUp(350);
            $(".menu_item li a").removeClass("active");

            // open new menu and add the open class
            $(this).next("ul").slideDown(350);
            $(this).addClass("active");
            //$(".side_menu").niceScroll({ horizrailenabled: false }); //add jquery nicescroll with horizontal scroll disabled
            
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
            //$("#bottom_menu").niceScroll();

        } else if ($(this).hasClass("active")) {

            $(this).removeClass("active");
            $(this).next("ul").slideUp(350);
        }
    });


    var side_collapsed = false;
    var btm_collapsed = false;

    //Collapse Side Menu
    $('#collapse_side').on('click', function () {

        side_collapsed = !side_collapsed;
        var arrow = document.getElementById('collapse_side');

        if (side_collapsed) {
            $('.side_menu').toggle('slide', 'left', 1200);
            // move the left collapse arrow along with menu and set it to be a right arrow (bring back menu)
            $('#collapse_side').css('position', 'absolute').animate({
                left: '-=270'
            }, {
                duration: 1500,
                complete: function () {
                    arrow.innerHTML = "&rarr;";
                }
            });
        }
        else {
            $('.side_menu').toggle('slide', 'left', 1200);
            // move the right collapse back along with menu
            $('#collapse_side').css('position', 'absolute').animate({
                left: '+=270'
            }, {
                duration: 1100,
                complete: function () {
                    arrow.innerHTML = "&larr;";
                }
            });
        }
    });


    //Collapse Bottom Menu
    $('#collapse_btm').on('click', function () {

        btm_collapsed = !btm_collapsed;
        var arrow = document.getElementById('collapse_btm');

        if (btm_collapsed) {
            //$('#bottom_menu').toggle('slide', 'down', 1200);
            $("#bottom_menu").slideToggle("slow");
            // move the left collapse arrow along with menu and set it to be a right arrow (bring back menu)
            $('#collapse_btm').css('position', 'absolute').animate({
                bottom: '-=270'
            }, {
                duration: 1500,
                complete: function () {
                    arrow.innerHTML = "&uarr;";
                }
            });

        }
        else {
            //$('#bottom_menu').toggle('slide', 'down', 1200);
            $("#bottom_menu").slideToggle("slow");
            // move the right collapse back along with menu
            $('#collapse_btm').css('position', 'absolute').animate({
                bottom: '+=270'
            }, {
                duration: 600,
                complete: function () {
                    arrow.innerHTML = "&darr;";
                }
            });
        }
    });

});
