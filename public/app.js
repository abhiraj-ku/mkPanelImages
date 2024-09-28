const gallery = document.getElementById("gallery");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.querySelector(".close");
let page = 1;
let totalImages = 0;

const apiBaseUrl = `https://mkpanelimages-1.onrender.com/api`;

async function fetchImages(page) {
  try {
    const response = await fetch(`${apiBaseUrl}/images?page=${page}`);
    if (!response.ok) throw new Error("Failed to load images");

    const { images, totalImages: total } = await response.json();
    totalImages = total;
    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

function openModal(imageUrl) {
  modal.style.display = "flex"; // Show modal
  modalImage.src = imageUrl;
}

function closeModalHandler() {
  modal.style.display = "none"; // Hide modal
}

function downloadImage(url) {
  const downloadUrl = `${apiBaseUrl}/download?url=${encodeURIComponent(url)}`;
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = url.split("/").pop();
  a.click();
}

function renderImages(images) {
  gallery.innerHTML = "";
  images.forEach((image) => {
    if (image.url) {
      const galleryItem = document.createElement("div");
      galleryItem.classList.add("gallery-item");

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = image.alt;

      // Attach click event to open modal
      img.addEventListener("click", () => openModal(image.url));

      const downloadBtn = document.createElement("button");
      downloadBtn.classList.add("download-btn");
      downloadBtn.innerText = "Download";
      downloadBtn.addEventListener("click", () => downloadImage(image.url));

      galleryItem.appendChild(img);
      galleryItem.appendChild(downloadBtn);
      gallery.appendChild(galleryItem);
    } else {
      console.warn("Image URL is missing for an image item.");
    }
  });
}

function updatePaginationButtons() {
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page * 15 >= totalImages;
}

async function loadImages() {
  const images = await fetchImages(page);
  if (images.length > 0) {
    renderImages(images);
    updatePaginationButtons();
  }
}

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    loadImages();
  }
});

nextBtn.addEventListener("click", () => {
  if (page * 15 < totalImages) {
    page++;
    loadImages();
  }
});

closeModal.addEventListener("click", closeModalHandler);
modal.addEventListener("click", closeModalHandler);

loadImages();
