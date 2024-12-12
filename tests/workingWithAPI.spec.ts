import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
  await expect(page.locator('.sidebar')).toContainText('automation');

  // ここの修正から
  await page.getByText('Sign in').click();
  await page.getByRole('textbox', { name: 'Email' }).fill('hachiman.hachi8@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Yashi0Takuy@');
  await page.getByRole('button').click();
});

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = 'This is a MOCK test title';
    responseBody.articles[0].description = 'This is a MOCK description';

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText('Global Feed').click();
  await page.waitForSelector('app-article-list h1');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title');
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('.sidebar')).toContainText('automation');
});

test('delete article', async ({ page, request }) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      user: {
        email: 'hachiman.hachi8@gmail.com',
        password: 'Yashi0Takuy@',
      },
    },
  });
  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      article: {
        title: 'this is a test',
        description: 'this is a test',
        body: 'this is a test',
        tagList: [],
      },
    },
    headers: {
      authorization: `Token ${accessToken}`,
    },
  });

  expect(articleResponse.status()).toEqual(201);

  await page.getByText('Global Feed').click();
  await page.getByText('this is a test').first().click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click();
  await page.getByText('Global Feed').click();

  await expect(page.locator('app-article-list h1').first()).not.toContainText('this is a test');

  // const articleResponseBody = await articleResponse.json();
  // console.log(articleResponseBody);

  // const forDaleteArticleSlag = articleResponseBody.article.slug;
  // console.log(forDaleteArticleSlag);

  // const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${forDaleteArticleSlag}`, {
  //   headers: {
  //     authorization: `Token ${accessToken}`,
  //   },
  // });
  // expect(deleteArticleResponse.status()).toEqual(204);

  // console.log(deleteArticleResponse);
});
