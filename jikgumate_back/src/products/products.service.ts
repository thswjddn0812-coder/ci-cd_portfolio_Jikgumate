import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
@Injectable()
export class ProductsService {
  async getProductInfo(url: string) {
    try {
      // 0. URL이 제대로 들어왔는지 디코딩 및 검증
      const decodedUrl = decodeURIComponent(url);
      // 1. URL에 접속해서 HTML 데이터 가져오기
      const { data } = await axios.get(decodedUrl, {
        headers: {
          // 봇으로 오해받지 않기 위해 브라우저인 척 하는 설정
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Referer: 'https://www.google.com/', // 구글에서 타고 들어온 척 하기
        },
      });

      const $ = cheerio.load(data);

      const title =
        $('meta[property="og:title"]').attr('content') || $('title').text();
      const image = $('meta[property="og:image"]').attr('content');
      const description = $('meta[property="og:description"]').attr('content');

      let priceText =
        $('.product-detail__price-value').first().text() || // 무신사 신형 레이아웃
        $('.total_price').text() || // 무신사 구형 레이아웃
        $('.price_sect').text() || // 기타 쇼핑몰
        '';

      // 2. 만약 태그에서 못 찾았다면 description에서 추출
      if (!priceText && description) {
        // description의 맨 뒤에서부터 숫자와 콤마 조합을 찾습니다.
        // (보통 '- 79,000' 처럼 마지막에 가격이 위치하기 때문)
        const matches = description.match(/[\d,]+/g);
        if (matches && matches.length > 0) {
          priceText = matches[matches.length - 1]; // 가장 마지막에 발견된 숫자를 선택
        }
      }

      // 3. 숫자만 남기고 정수로 변환
      // replace(/[^0-9]/g, '')는 숫자 이외의 모든 문자(콤마, 원, 문자 등)를 제거합니다.
      const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

      return {
        title: title?.trim(),
        image: image,
        price: numericPrice, // 이제 79000이 나올 겁니다!
        desc: description?.trim(),
        url: url,
      };
    } catch (error) {
      // 터미널에 에러의 상세 내용을 찍어줍니다.
      console.error('--- 크롤링 에러 상세 ---');
      if (error.response) {
        // 응답은 왔으나 상태 코드가 에러인 경우 (예: 403 Forbidden)
        console.error('Status:', error.response.status);
      } else {
        // 아예 접속이 안 된 경우
        console.error('Message:', error.message);
      }
      return {
        error: '정보를 가져오는데 실패했습니다.',
        detail: error.message,
      };
    }
  }
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
