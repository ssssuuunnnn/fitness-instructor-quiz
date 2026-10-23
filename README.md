# 健身指導員初級學科題庫

102–114 年健身指導員初級學科歷屆試題（1,854 題，合併重複後 1,365 題）的靜態網站。

- `index.html`：隨機測驗（預設 30 題，可選科目、題數、只出錯題），送出後顯示答案、出現年度與說明
- `review.html`：答題紀錄、目前錯題、曾經答錯，一鍵練習錯題
- `bank.html`：題庫總覽，順序與 Excel 彙整表相同，可搜尋與依科目篩選

作答紀錄存在瀏覽器的 localStorage，不會上傳到任何地方。

## 部署到 GitHub Pages

1. 建立 repo（預設網址設定為 `https://ssssuuunnnn.github.io/fitness-instructor-quiz/`）
2. 把這個資料夾所有檔案（含 `.nojekyll`）放到 repo 根目錄並 push
3. Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`

若 repo 名稱或網址不同，請全域取代以下檔案中的 `https://ssssuuunnnn.github.io/fitness-instructor-quiz/`：
`index.html`、`review.html`、`bank.html`、`robots.txt`、`sitemap.xml`。

上線後可到 Google Search Console 提交 `sitemap.xml`。
