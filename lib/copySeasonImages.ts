import fs from "fs";
import path from "path";

export function ensureSeasonImages() {
  const images = [
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\season_tops_1790743909752.jpg",
      dest: "public/images/season_tops.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\season_knitwear_1790743925544.jpg",
      dest: "public/images/season_knitwear.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\season_shoes_1790743945038.jpg",
      dest: "public/images/season_shoes.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\season_shorts_1790743964125.jpg",
      dest: "public/images/season_shorts.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\offer_closing_banner_1790744380089.jpg",
      dest: "public/images/offer_closing_banner.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\community_our_story_1790744864633.jpg",
      dest: "public/images/community_our_story.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\bestseller_singh_black_tee_1790745222973.jpg",
      dest: "public/images/bestseller_singh_black_tee.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\bestseller_singh_tote_1790745256526.jpg",
      dest: "public/images/bestseller_singh_tote.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\bestseller_kaur_tote_1790745275390.jpg",
      dest: "public/images/bestseller_kaur_tote.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\bestseller_baaj_tee_1790745296643.jpg",
      dest: "public/images/bestseller_baaj_tee.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\review_green_hoodie_1790745776014.jpg",
      dest: "public/images/review_green_hoodie.jpg",
    },
    {
      src: "C:\\Users\\Betopia\\.gemini\\antigravity-ide\\brain\\7ce35bd7-b975-42f0-955f-ea89016794cc\\.user_uploaded\\media_1790746876806.png",
      dest: "public/images/logo.png",
    },
  ];

  const targetDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const item of images) {
    try {
      const destPath = path.join(process.cwd(), item.dest);
      if (!fs.existsSync(destPath) && fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, destPath);
      }
    } catch (err) {
      console.error("Error ensuring season image:", err);
    }
  }
}
