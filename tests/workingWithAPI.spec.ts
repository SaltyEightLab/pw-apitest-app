import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });
  await page.goto('https://conduit.bondaracademy.com/');
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
  await page.waitForTimeout(1000);
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title');
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description');
});

test('delete article', async ({ page, request }) => {
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     user: {
  //       email: 'hachiman.hachi8@gmail.com',
  //       password: 'Yashi0Takuy@',
  //     },
  //   },
  // });
  // const responseBody = await response.json();
  // const accessToken = responseBody.user.token;

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      article: {
        title: 'this is a test',
        description: 'this is a test',
        body: 'this is a test',
        tagList: [],
      },
    },
    // headers: {
    //   authorization: `Token ${accessToken}`,
    // },
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

test('create article', async ({ page, request }) => {
  await page.getByText('New Article').click();
  await page.getByPlaceholder('Article Title').fill('This is a test');
  await page.getByPlaceholder("What's this article about?").fill('This is a test');
  await page.getByPlaceholder('Write your article (in markdown)').fill('This is a test');
  await page.getByText('Publish Article').click();
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const responseBody = await articleResponse.json();
  const articleSlug = responseBody.article.slug;
  await page.getByText('conduit').first().click();

  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test');

  // const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     user: {
  //       email: 'hachiman.hachi8@gmail.com',
  //       password: 'Yashi0Takuy@',
  //     },
  //   },
  // });
  // const loginResponseBody = await loginResponse.json();
  // const accessToken = loginResponseBody.user.token;

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`);
  expect(deleteArticleResponse.status()).toEqual(204);
});
