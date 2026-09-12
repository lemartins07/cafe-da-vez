import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
const carouselData = [
  {
    thumbnail: '/template/images/carousel/carousel-01.png',
  },
  {
    thumbnail: '/template/images/carousel/carousel-03.png',
  },
  {
    thumbnail: '/template/images/carousel/carousel-02.png',
  },
  {
    thumbnail: '/template/images/carousel/carousel-04.png',
  },
];
export default function WithIndicators() {
  const swiperOptions = {
    modules: [Pagination, Autoplay],
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  };
  return (
    <div className="carouselThree relative rounded-lg border border-gray-200 dark:border-gray-800">
      <Swiper {...swiperOptions}>
        {/* <!-- slider item --> */}
        {carouselData.map((item, i) => (
          <SwiperSlide key={i + 1}>
            <div className="overflow-hidden rounded-lg">
              <img
                src={item.thumbnail}
                className="w-full rounded-lg"
                alt="carousel"
              />
            </div>
          </SwiperSlide>
        ))}
        {/* <!-- If we need pagination --> */}
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
}
