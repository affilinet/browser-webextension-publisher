/*!
 * Custom CSS for affilinet Wordpress Plugin
*/

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: 'nav.fixed-sidebar', 
    offset: 100
})

// Adjust offset of scrolling target when using navbar anchors
var offset = 80;
$('nav.fixed-sidebar li a').click(function(event) {
    event.preventDefault();
    $($(this).attr('href'))[0].scrollIntoView();
    scrollBy(0, -offset);
});

