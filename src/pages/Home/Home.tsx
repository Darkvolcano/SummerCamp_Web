import React from 'react';
import { Card, Row, Col } from 'antd';
import { 
  SafetyCertificateOutlined,
  HeartOutlined,
  // TrophyOutlined,
  StarFilled,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import supporticon from "../../assets/support icon.png";
import gradicon from "../../assets/grad icon.png";
import lightbulb from "../../assets/lightbulb icon.png";
import safeicon from "../../assets/safe icon.png";
import teamicon from "../../assets/team icon.png";
const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/register');
  };

  // Features data
  // const features = [
  //   {
  //     icon: <SafetyCertificateOutlined className="text-4xl text-orange-500" />,
  //     title: 'An toàn tuyệt đối',
  //     description: 'Môi trường an toàn với đội ngũ giám sát 24/7 và các biện pháp bảo vệ nghiêm ngặt',
  //   },
  //   {
  //     icon: <TeamOutlined className="text-4xl text-orange-500" />,
  //     title: 'Đội ngũ chuyên nghiệp',
  //     description: 'Huấn luyện viên giàu kinh nghiệm và tâm huyết với trẻ em',
  //   },
  //   {
  //     icon: <TrophyOutlined className="text-4xl text-orange-500" />,
  //     title: 'Chương trình đa dạng',
  //     description: 'Nhiều hoạt động thú vị phát triển toàn diện cho trẻ',
  //   },
  //   {
  //     icon: <HeartOutlined className="text-4xl text-orange-500" />,
  //     title: 'Chăm sóc tận tình',
  //     description: 'Quan tâm đến từng trẻ với sự yêu thương và trách nhiệm',
  //   },
  // ];

  // Camp categories
  const campCategories = [
    {
      image: '/images/2Explore.jpg',
      title: 'Trại khám phá',
      description: 'Khám phá thiên nhiên và môi trường xung quanh',
    },
    {
      image: '/images/2Game.jpg',
      title: 'Trại trò chơi',
      description: 'Học tập qua các trò chơi vận động và tư duy',
    },
    {
      image: '/images/3Game.jpg',
      title: 'Trại thể thao',
      description: 'Rèn luyện sức khỏe và kỹ năng thể thao',
    },
    {
      image: '/images/3GirlRead.jpg',
      title: 'Trại đọc sách',
      description: 'Nuôi dưỡng tình yêu đọc sách và học hỏi',
    },
    {
      image: '/images/3hill.jpg',
      title: 'Trại leo núi',
      description: 'Chinh phục đỉnh cao và rèn luyện ý chí',
    },
    {
      image: '/images/4talk.jpg',
      title: 'Trại giao tiếp',
      description: 'Phát triển kỹ năng mềm và giao tiếp',
    },
  ];

  // Services
  const services = [
    {
      title: 'Tìm kiếm trại hè dễ dàng',
      description: 'Dễ dàng tìm kiếm và so sánh các chương trình trại hè phù hợp với con bạn',
      icon: <SearchOutlined className="text-5xl text-orange-500" />,
    },
    {
      title: 'Đăng ký nhanh chóng',
      description: 'Quy trình đăng ký đơn giản, tiện lợi chỉ với vài bước',
      icon: <TeamOutlined className="text-5xl text-orange-500" />,
    },
    {
      title: 'Thanh toán an toàn',
      description: 'Hệ thống thanh toán bảo mật với nhiều phương thức linh hoạt',
      icon: <SafetyCertificateOutlined className="text-5xl text-orange-500" />,
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ mọi lúc',
      icon: <HeartOutlined className="text-5xl text-orange-500" />,
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Nguyễn Thị Mai',
      role: 'Phụ huynh',
      rating: 5,
      content: 'Con tôi đã có những trải nghiệm tuyệt vời tại trại hè. Các hoạt động rất bổ ích và an toàn. Đội ngũ huấn luyện viên rất tận tâm.',
    },
    {
      name: 'Trần Văn Hùng',
      role: 'Phụ huynh',
      rating: 5,
      content: 'Trại hè đã giúp con tôi trở nên tự tin và độc lập hơn. Các kỹ năng sống mà con học được rất hữu ích.',
    },
    {
      name: 'Lê Thị Hương',
      role: 'Phụ huynh',
      rating: 5,
      content: 'Tôi rất hài lòng với chất lượng dịch vụ. Cơ sở vật chất hiện đại và đội ngũ nhân viên chuyên nghiệp.',
    },
  ];

  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[700px] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(/images/GroupLearn.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Content */}
        <div className="relative z-10 px-4 max-w-6xl mx-auto pt-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Khám phá, học hỏi và kết bạn
              </span>
              <span className="text-white block mt-2">
                trong môi trường trại hè an toàn
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Tham gia trại hè để con bạn có cơ hội phát triển toàn diện về kỹ năng, 
              kiến thức và trải nghiệm những kỷ niệm đáng nhớ cùng bạn bè mới.
            </p>
            <button
              onClick={handleSignUpClick}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-10 py-4 rounded-xl text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>

      {/* Tại sao nên chọn CampEase Section */}
      <section className="py-20 ">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Tại sao nên chọn CampEase?
          </h2>
          
          <div className="">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              CampEase đặc biệt chú trọng việc{' '}
              <span className="font-bold text-orange-600">
                truyền tải kiến thức thông qua các hoạt động thực hành thú vị
              </span>{' '}
              và{' '}
              <span className="font-bold text-orange-600">
                ứng dụng các bài học lý thuyết vào cuộc sống thường thức
              </span>{' '}
              để tạo ra được những sản phẩm trong cuộc sống hằng ngày.
            </p>
          </div>

        </div>

{/* Grid Layout - 3 rows x 3 columns */}
<div className="max-w-[1000px] mx-auto px-4 mt-12">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
    
    {/* Row 1: Photo 1 + Card 1 + Card 2 */}

    <div className="w-full md:w-[300px] h-[300px] mx-auto">
      <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <img 
          src="/images/3hill.jpg" 
          alt="Trẻ em leo núi"
          className="w-full h-full object-cover object-bottom"
        />
      </div>
    </div>

    <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
          <img src={supporticon} alt="Support" className="w-full h-full" />
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-500 mb-2">Hợp tác và hỗ trợ lẫn nhau</h3>
          <ul className="text-gray-600 text-xs space-y-1 text-left">
            <li>✓ Tư duy phản biện được trau dồi</li>
            <li>✓ Xem việc thất bại là cơ hội để học hỏi</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
          <img src={lightbulb} alt="Lightbulb" className="w-full h-full" />
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-500 mb-2">Sáng tạo</h3>
          <ul className="text-gray-600 text-xs space-y-1 text-left">
            <li>✓ Tư duy sáng tạo</li>
            <li>✓ Hoạt động khám phá thực tế</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Row 2: Card 3 + Card 4 + Photo 2 */}
    <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
          <img src={safeicon} alt="Safety" className="w-full h-full" />
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-500 mb-2">An toàn</h3>
          <ul className="text-gray-600 text-xs space-y-1 text-left">
            <li>✓ Đề cao sự an toàn trong mọi hoạt động</li>
            <li>✓ Ăn uống được đảm bảo chất lượng</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
          <img src={teamicon} alt="Team" className="w-full h-full" />
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-500 mb-2">Đội ngũ chuyên nghiệp</h3>
          <ul className="text-gray-600 text-xs space-y-1 text-left">
            <li>✓ Giáo viên giàu kinh nghiệm</li>
            <li>✓ Ứng dụng nội dung thực tế</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="w-full md:w-[300px] h-[300px] mx-auto">
      <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <img 
          src="/images/2Game.jpg" 
          alt="Trẻ em chơi trò chơi"
          className="w-full h-full object-cover object-left"
        />
      </div>
    </div>

    {/* Row 3: Card 5 + Photo 3 spans 2 columns */}
    <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
          <img src={gradicon} alt="Graduation" className="w-full h-full" />
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-500 mb-2">Phát triển toàn diện</h3>
          <ul className="text-gray-600 text-xs space-y-1 text-left">
            <li>✓ Đa dạng lứa tuổi và sở thích</li>
            <li>✓ Kết hợp học và chơi</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="w-full md:col-span-2 h-[300px] mx-auto">
      <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <img 
          src="/images/3GirlRead.jpg" 
          alt="Các bé gái đọc sách"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

  </div>
</div>

  </section>





      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="relative">
                <img
                  src="/images/close-up-girl-child-friends-park-smiling-camera.jpg"
                  alt="Children at camp"
                  className="w-full rounded-3xl shadow-2xl"
                />
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Trại hè dành cho mọi lứa tuổi
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Tìm chương trình trại hè phù hợp cho con bạn tại CampEase
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 text-xl">✓</span>
                    <span>Truy cập hơn 100+ chương trình trại hè từ các tổ chức uy tín</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 text-xl">✓</span>
                    <span>Kết nối nhanh chóng với ban tổ chức trại hè</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 text-xl">✓</span>
                    <span>Quy trình đăng ký đơn giản và tiện lợi</span>
                  </li>
                </ul>
                <button
                  onClick={handleSignUpClick}
                  className="mt-6 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300"
                >
                  Bắt đầu ngay
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Find Match Section */}
      <section className="py-20 bg-[rgba(15,15,15,0.95)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Tìm trại hè phù hợp cho bạn
              </span>
            </h2>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={12} lg={10}>
              <Card className="bg-white rounded-2xl overflow-hidden shadow-xl border-0 h-full">
                <div className="h-56 overflow-hidden">
                  <img
                    src="/images/close-up-girl-child-friends-park-smiling-camera.jpg"
                    alt="For Parents"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Dành cho Phụ huynh</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Tìm kiếm và đăng ký các chương trình trại hè chất lượng cao cho con bạn. 
                    Dễ dàng theo dõi và quản lý đăng ký.
                  </p>
                  <button
                    onClick={() => navigate('/camps')}
                    className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                  >
                    Khám phá ngay →
                  </button>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={10}>
              <Card className="bg-white rounded-2xl overflow-hidden shadow-xl border-0 h-full">
                <div className="h-56 overflow-hidden">
                  <img
                    src="/images/GroupLearn.jpg"
                    alt="For Organizers"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Dành cho Ban tổ chức</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Quản lý chương trình trại hè, nhân viên và học viên một cách hiệu quả. 
                    Hệ thống quản lý toàn diện.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                  >
                    Đăng nhập →
                  </button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Khám phá danh mục</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Các loại trại hè</h3>
            <Row gutter={[24, 24]}>
              {campCategories.map((category, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <div className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-3 shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                      {category.title}
                    </h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="text-right mt-4">
              <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                Xem thêm →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Phản hồi từ phụ huynh
            </h2>
            <p className="text-gray-600 text-lg">
              Những trải nghiệm thực tế từ cộng đồng của chúng tôi
            </p>
          </div>

          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarFilled key={i} className="text-yellow-400 text-lg" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-white via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Dịch vụ của chúng tôi</h2>
          <Row gutter={[32, 32]}>
            {services.map((service, index) => (
              <Col xs={24} sm={12} key={index}>
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-12">
            <button className="px-10 py-4 border-2 border-orange-500 text-orange-500 font-semibold rounded-full hover:bg-orange-50 transition-all duration-300">
              Xem thêm
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng cho mùa hè tuyệt vời?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để con bạn có cơ hội trải nghiệm những hoạt động 
            bổ ích và thú vị trong mùa hè này!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSignUpClick}
              className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Đăng ký ngay
            </button>
            <button
              onClick={() => navigate('/camps')}
              className="bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300"
            >
              Xem các trại hè
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
