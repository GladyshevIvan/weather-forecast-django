from django.test import TestCase
from django.urls import reverse

class ForecastIndexViewTests(TestCase):
    def test_index_view_returns_200(self):
        '''Проверка, что представление работает и отвечает на запросы'''

        response = self.client.get(reverse('index'))  # Используйте reverse для получения URL
        self.assertEqual(response.status_code, 200)

    def test_index_view_renders_template(self):
        '''Проверка, что шаблон index был использован при рендеринге ответа'''

        response = self.client.get(reverse('index'))
        self.assertTemplateUsed(response, 'forecast/index.html')

    def test_index_view_contains_csrf_token(self):
        '''Проверка, что в HTML-коде главной страницы есть CSRF-токен'''

        response = self.client.get(reverse('index'))
        self.assertContains(response, 'csrfmiddlewaretoken')