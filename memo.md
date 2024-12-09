// _/\*\*/api/tags にマッチする api リクエストをインターセプトする。
await page.route('_/\*\*/api/tags', async (route) => {
// インターセプトしたリクエストに代わりのものを充てる
await route.fulfill({
//代わりのデータとして tags オブジェクトを json 化したものを渡す。
body: JSON.stringify(tags),
});
});
//この api リクエストのインターセプトとモック化を終えた後、下記 URL にアクセスする。
await page.goto('https://conduit.bondaracademy.com/');
//ページのサイドバーに automation というテキストが含まれているかを検証する。
await expect(page.locator('.sidebar')).toContainText('automation');

Playwright: Web Automation Testing From Zero to Hero
Section 7: Working with APIs 55. Mocking API 完了！
Q&A を見る限り、やはりここら辺でつまづいている人多いようだ！
単体テスト勉強しているときも思ったけど、モックの話が始まると難しくなる。
ここをちゃんと乗り越えられますように！！
