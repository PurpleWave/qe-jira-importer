test.describe('<Title> @<JIRA ISSUE NUMBER>', () => {
    let pageObject: <PAGENAME>Page;

    test.beforeEach(async ({ page }) => {
        // Initialize the Page Object
        pageObject = new <PAGENAME>Page(page);
        navigate = new NavigationPage(page);

    });

    /**
     * AC IS PLACED HERE IN COMMENTS
     */
    test('Navigate to <PAGENAME>', async ({ page }) => {

    });
});
